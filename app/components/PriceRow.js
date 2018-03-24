import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 8
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        margin: 5,
        padding: 2
    },
    priceCell: {
        flex:1
    },
    firstCell: {
        flex: 2,
        alignItems: 'flex-start',
        margin: 5,
        padding: 2,
        marginLeft: 0,
        paddingLeft: 0,
    },
    textContent: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'poppins-medium',
        textAlign: 'right',
    },
    title: {
        textAlign: 'left',
    },
    pill: {
        backgroundColor: '#1C1C1C',
        borderRadius: 5,
        alignItems: 'center',
        margin: 5,
        padding: 2
    },
    greenPill: {
        backgroundColor: '#3DBC72',
        borderRadius: 5,
        alignItems: 'center',
        margin: 5,
        padding: 2
    },
    redPill: {
        backgroundColor: '#BC4242',
        borderRadius: 5,
        alignItems: 'center',
        margin: 5,
        padding: 2
    }
});

export default PriceRow = ({title, price, diff}) => (
    <View style={styles.container}>
        <View style={styles.firstCell}>
            <Text style={[styles.textContent, styles.title]}>{title}</Text>
        </View>
        <View style={styles.cell}>
            <Text style={styles.textContent}>{price.toFixed(2)}</Text>
        </View>
        <View style={styles.priceCell}>
            <View style={diff > 0 ? styles.redPill : (diff < 0 ? styles.greenPill : styles.pill)}>
                <Text style={styles.textContent}>{diff > 0 ? '+' : ''}{diff.toFixed(2)}</Text>
            </View>
        </View>
    </View>
)