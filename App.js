import React from 'react';
import { Font } from 'expo';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';

import PriceRow from './components/PriceRow';

const cheerio = require('react-native-cheerio');

const requestUrl = 'https://www.micm.gob.do/direcciones/hidrocarburos/avisos-semanales-de-precios/combustibles';

export default class App extends React.Component {
  state = {
    fontsLoaded: false,
    dataLoaded: false,
  }
  async componentDidMount() {
    await Font.loadAsync({
      'poppins-bold': require('./assets/fonts/Poppins-Bold.ttf'),
      'poppins-medium': require('./assets/fonts/Poppins-Medium.ttf'),
      'poppins-regular': require('./assets/fonts/Poppins-Regular.ttf'),
    });

    // Request
    fetch(requestUrl)
    .then((response) => response.text())
    .then((html) => {
      let $ = cheerio.load(html);

      // get date range title
      this.setState({title: $('.uk-grid.uk-grid-collapse.uk-visible-large .uk-text-small').first().text()});

      // get data object
      function findTextAndReturnRemainder(target, variable){
          var chopFront = target.substring(target.search(variable)+variable.length,target.length);
          var result = chopFront.substring(0,chopFront.search(";"));
          return result;
      }

      let scriptContent = $('script[type="text/javascript"]:not([src])').first().html();
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
  render() {
    return (
      this.state.fontsLoaded && this.state.data ? (<View style={styles.container}>
        <Text style={styles.headerTitle}>Precios de Combustibles</Text>
        <Text style={styles.weekTitle}>Semana{this.state.title}</Text>

        <FlatList 
          style={styles.list}
          data={this.state.data}
          renderItem={({item}) => <PriceRow 
                                    title={item.name}
                                    price={item.price}
                                    lastPrice={item.lastPrice} />
                      }
        />
      </View>) : <View style={styles.loading}><ActivityIndicator size="large" color="#4E566F"/></View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282F45',
    paddingTop: 60,
    paddingLeft: 35,
    paddingRight: 35
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'poppins-bold'
  },
  weekTitle: {
    marginTop: 10,
    color: '#d1d1d1',
    fontSize: 15,
    fontFamily: 'poppins-regular'
  },
  loading: {
    flex: 1,
    backgroundColor: '#282F45',
    alignItems: 'center',
    justifyContent: 'center'
  },
  list: {
    marginTop: 20
  }
});
