import { StackNavigator } from 'react-navigation';

import Home from '../screens/Home';
import Options from '../screens/Options';

export default StackNavigator({
    Home: {
        screen: Home,
        navigationOptions: {
            header: () => null,
            title: 'Precios'
        }
    },
    Options: {
        screen: Options,
        navigationOptions: {
            title: 'Opciones'
        }
    }
}, {mode: 'modal'});