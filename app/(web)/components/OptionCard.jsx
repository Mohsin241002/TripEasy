import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function WebOptionCard({option, selectedOption}) {
  return (
    <View style={[styles.container, selectedOption?.id==option?.id && styles.selectedContainer]}>
        <View style={styles.contentContainer}>
            <Text style={styles.title}>{option.title}</Text>
            <Text style={styles.description}>{option.desc}</Text>
        </View>
        <Text style={styles.icon}>
            {option.icon}
        </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 25,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        marginBottom: 15,
        maxWidth: 500,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        // Web-specific hover effect
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        }
    },
    selectedContainer: {
        borderWidth: 3,
        borderColor: '#2D68FE',
        backgroundColor: '#EDF2FF',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontFamily: 'outfit-bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        fontFamily: 'outfit',
        color: '#333eee',
    },
    icon: {
        fontSize: 40,
        marginLeft: 15,
    }
}); 