import React, { Component } from 'react';
import { Permissions, Notifications } from 'expo';
import { StatusBar, SafeAreaView, View, Text, Switch, StyleSheet, AsyncStorage } from 'react-native';

const PUSH_ENDPOINT = 'https://combustibles.herokuapp.com/api/notifications/token/';

async function pushNotificationsAsyncRegistration(on) {
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
    if(on) {
        return fetch(PUSH_ENDPOINT + token, {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            }
        });
    } else {
        return fetch(PUSH_ENDPOINT + token, {
            method: 'DELETE',
            headers: {
            Accept: 'application/json',
            }
        });
    }
}

async function updateStoredState(enabled) {
    try {
        await AsyncStorage.setItem('@CombustiblesStore:notifications', enabled ? 'true' : 'false');
    } catch (error) {
        // Error saving data
    }
}

class Options extends Component {
    state = {
        notificationEnabled: false
    }

    async componentDidMount() {
        try {
            const val = await AsyncStorage.getItem('@CombustiblesStore:notifications');
            if (val !== null) {
                this.setState({notificationEnabled: (val == 'true')});
            }
        } catch (error) {
            // Error getting key
        }
    }

    handleNotificationToggle = (value) => {
        this.setState({notificationEnabled: value});

        let notify = pushNotificationsAsyncRegistration(value).then(res => res.json()).then((response) => {
            if(value) {
                alert('Las notificaciones de actualización han sido habilitadas.');
            } else {
                alert('Las notificaciones de actualización han sido deshabilitadas.');
            }

            updateStoredState(value);
        }).catch(err => {
            alert('Ocurrió un error al cambiar su configuración de notifiaciones.');
            this.setState({notificationEnabled: !value});
        });
          
    }

    render() {
        return (
            <View style={{flex:1}}>
                <StatusBar barStyle="default"/>
                <SafeAreaView style={{flex:1}}>
                    <View style={styles.container}>
                        <View style={styles.configuration}>
                            <Text style={styles.sectionHead}>Notificaciones</Text>
                            <View style={styles.option}>
                                <Text style={styles.optionTitle}>Notificarme cuando se actualizan los precios</Text>
                                <View style={styles.optionSwitch}>
                                    <Switch value={this.state.notificationEnabled} onValueChange={this.handleNotificationToggle} />
                                </View>
                                
                            </View>
                        </View>
                        <View style={styles.about}>
                            <Text style={styles.aboutText}>Los precios de combustibles son actualizados automáticamente con información directa del Ministerio de Industria, Comercio y MiPymes de la República Dominicana.</Text>
                            <Text style={styles.copyText}>Desarrollado en Santo Domingo por Pedro S. López</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1
    },
    configuration: {
        flex: 1
    },
    about: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    aboutText: {
        textAlign: 'center'
    },
    copyText: {
        paddingTop: 25
    },
    sectionHead: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 10
    },
    option: {
        flexDirection: 'row'
    },
    optionTitle: {
        flex: 4,
    },
    optionSwitch: {
        flex: 1,
        alignItems: 'flex-end'
    }
});

export default Options;