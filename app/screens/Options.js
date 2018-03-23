import React, {Component} from 'react';
import { StatusBar, SafeAreaView, View, Text } from 'react-native';

class Options extends Component {
    handleEnableNotifications = () => {

    }

    render() {
        return (
            <SafeAreaView style={{flex:1}}>
                <StatusBar barStyle="default"/>
                <View style={{flex:1, alignItems: 'center'}}>
                    <Text style={{paddingTop: 10}}>Las notificaciones han sido temporalmente deshabilitadas.</Text>
                </View>
                
            </SafeAreaView>
        )
    }
}

export default Options;