import React from 'react';
import { Permissions, Notifications, Font } from 'expo';
import { StyleSheet, SafeAreaView, Platform, 
    Text, View, FlatList, ActivityIndicator, 
    Image, TouchableOpacity, StatusBar } from 'react-native';

import PriceRow from '../components/PriceRow';

const cheerio = require('react-native-cheerio');

const requestUrl = 'https://micm.gob.do/direcciones/hidrocarburos/avisos-semanales-de-precios/precios-de-combustibles';

export default class App extends React.Component {
  state = {
    fontsLoaded: false,
    dataLoaded: false,
  }
  async componentDidMount() {
    await Font.loadAsync({
      'poppins-bold': require('../../assets/fonts/Poppins-Bold.ttf'),
      'poppins-medium': require('../../assets/fonts/Poppins-Medium.ttf'),
      'poppins-regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    });

    // Request
    fetch(requestUrl)
    .then((response) => response.text())
    .then((html) => {
      let $ = cheerio.load(html);

      function findTextAndReturnRemainder(target, variable){
        var chopFront = target.substring(target.search(variable)+variable.length,target.length);
        var result = chopFront.substring(0,chopFront.search(";"));
        return result;
      }

      let scriptContent = $('script[type="text/javascript"]:not([src])').first().html();

      // get date range title
      let findAndCleanTitle = findTextAndReturnRemainder(scriptContent, "window.ArtDataData16 = ");
      let dataResult = JSON.parse(findAndCleanTitle);
      this.setState({title: dataResult[0].rangoDeVigencia});

      // get data object
      let findAndClean = findTextAndReturnRemainder(scriptContent, "var ArtDataChartDefinition13 = ");
      let result = JSON.parse(findAndClean);

      let gasTypes = {};
      
      let currentPrices = result.dataset['S. Actual'];
      let lastPrices = result.dataset['S. Anterior'];

      for(let i=0; i<currentPrices.length;i++) {
        gasTypes[currentPrices[i].name] = {
          name: currentPrices[i].name,
          key: i,
          price: currentPrices[i].value,
          lastPrice: lastPrices[i].value
        }
      }

      this.setState({data: Object.values(gasTypes)});
    }).catch((error) => {
      console.error(error);
    });

    this.setState({ fontsLoaded: true });
  }

  handleOptionPress = () => {
      this.props.navigation.navigate('Options');
  }

  render() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{flex: 1}}>
                <StatusBar barStyle="light-content"/>
                {this.state.fontsLoaded && this.state.data ? 
                (<View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Precios de Combustibles</Text>
                        <TouchableOpacity onPress={this.handleOptionPress} style={styles.settingsIcon}>
                            <Image style={styles.settingsIconImage} resizeMode="contain" source={require('../../assets/images/gear.png')} />
                        </TouchableOpacity>
                    </View>
                
                <Text style={styles.weekTitle}>{this.state.title}</Text>

                <FlatList 
                    style={styles.list}
                    data={this.state.data}
                    renderItem={({item}) => <PriceRow 
                                            title={item.name}
                                            price={item.price}
                                            diff={parseFloat(item.price - item.lastPrice)} />
                                }
                />
                </View>) : 
                <View style={styles.loading}>
                <ActivityIndicator size="large" color="#4E566F"/>
                </View>}
            </View>
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#282F45',
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS == 'ios' ? 20 : 40,
        paddingLeft: 35,
        paddingRight: 35
    },
    header: {
        flexDirection: 'row',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 28,
        fontFamily: 'poppins-bold',
        flex:6,
    },
    settingsIcon: {
        flex:1,
        alignItems: 'flex-end',
    },
    settingsIconImage: {
        width: 24
    },
    weekTitle: {
        marginTop: 10,
        color: '#d1d1d1',
        fontSize: 15,
        fontFamily: 'poppins-regular'
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    list: {
        marginTop: 20
    }
});
