/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Button,
  useColorScheme,
  View,
  FlatList,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const getYtIdFromUrl = (url: string) => {
  // id already
  if (!url.includes('/')) {
    return url;
  }
  const urlObj = new URL(url);

  if (urlObj.host === 'youtu.be') {
    return urlObj.pathname.slice(1);
  } else if (urlObj.host === 'www.youtube.com') {
    return urlObj.searchParams.get('v') || null;
  } else {
    return null;
  }
};

const apiBaseUrl = 'https://yakovlitvin.pro/8fy';
const requestSummary = async (videoId: string) => {
  try {
    const response = await fetch(`${apiBaseUrl}/summary/${videoId}`);
    return await response.text();
  } catch (error) {
    if (error instanceof Object && 'message' in error) {
      return 'Something went wrong: ' + error.message;
    } else {
      return 'Something went wrong';
    }
  }
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [urlInput, setUrlInput] = useState('');
  const [summaryText, setSummaryText] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const screenHeight = Dimensions.get('window').height;

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            minHeight: screenHeight,
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDarkMode ? Colors.white : Colors.black,
                },
              ]}>
              8fy lecture summary
            </Text>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="Insert video URL or id"
            />
            <Button
              title="Get summary"
              onPress={() => {
                if (urlInput === '') {
                  setSummaryText('Please set url or id');
                  return;
                }
                setSummaryText('loading..');
                const videoId = getYtIdFromUrl(urlInput);
                if (videoId) {
                  requestSummary(videoId)
                    .then(setSummaryText)
                    .catch(() => setSummaryText('problem loading summary'));
                } else {
                  // TODO: indicate that the format is unknown
                }
              }}
            />
            <FlatList
              data={summaryText.split('\n')}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => <Text style={styles.result}>{item}</Text>}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  highlight: {
    fontWeight: '700',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  result: {
    marginTop: 12,
    fontSize: 18,
  },
});

export default App;
