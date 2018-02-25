import React from 'react';
import { Permissions, Notifications, Font } from 'expo';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';

import PriceRow from './components/PriceRow';

const cheerio = require('react-native-cheerio');

const requestUrl = 'https://www.micm.gob.do/direcciones/hidrocarburos/avisos-semanales-de-precios/combustibles';
const PUSH_ENDPOINT = 'https://combustibles.herokuapp.com/api/notifications/token/';

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();

  // POST the token to your backend server from where you can retrieve it to send push notifications.
  return fetch(PUSH_ENDPOINT + token, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    }
  });
}

export default class App extends React.Component {
  state = {
    fontsLoaded: false,
    dataLoaded: false,
  }
  async componentDidMount() {
    await registerForPushNotificationsAsync();

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
      this.state.fontsLoaded && this.state.data ? 
      (<View style={styles.container}>
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
      </View>) : 
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4E566F"/>
      </View>
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
