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
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const getYtIdFromUrl = (url: string) => {
  // Currently it's always 11 chars, 9 were used earlier;
  // keeping this less strict (9+) for forward compatibility
  const youtubeVideoIdPattern = '[\\w-]{9,}';

  // id itself
  if (url.match(new RegExp(`^${youtubeVideoIdPattern}$`))) {
    return url;
  }

  const shortUrlPattern = `youtu.be/(${youtubeVideoIdPattern})`;
  const shortUrlMatch = new RegExp(shortUrlPattern).exec(url);
  if (shortUrlMatch) {
    return shortUrlMatch[1];
  }

  const longUrlPattern = 'youtube.com/watch?(.+)$';
  const longUrlMatch = new RegExp(longUrlPattern).exec(url);
  if (longUrlMatch) {
    const queryPattern = `v=(${youtubeVideoIdPattern})`;
    const idMatch = new RegExp(queryPattern).exec(longUrlMatch[1]);
    if (idMatch) {
      return idMatch[1];
    }
  }

  return null;
};

const apiBaseUrl = 'https://yakovlitvin.pro/8fy';
const requestSummary = async (
  videoId: string,
  onResponseUpdate: (updater: (text: string) => string) => void,
) => {
  try {
    const response = await fetch(`${apiBaseUrl}/summary/${videoId}`);
    const reader = response.body?.getReader();
    if (!reader) {
      const text = await response.text();
      onResponseUpdate(() => text);
      return;
    }

    const decoder = new TextDecoder();
    while (true) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }

      // Decode the chunk and update the summary text
      onResponseUpdate(
        prevText => prevText + decoder.decode(value, {stream: true}),
      );
    }

    // Final decode to flush any remaining bytes
    onResponseUpdate(prevText => prevText + decoder.decode());
  } catch (error) {
    if (error instanceof Object && 'message' in error) {
      const msg = error.message;
      onResponseUpdate(() => 'Something went wrong: ' + msg);
    } else {
      onResponseUpdate(() => 'Something went wrong');
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
                const videoId = getYtIdFromUrl(urlInput);
                if (!videoId) {
                  setSummaryText(
                    'Please insert a YouTube url or id (the currently used format is unsupported)',
                  );
                  return;
                }

                setSummaryText('loading..');
                try {
                  requestSummary(videoId, setSummaryText);
                } catch (error) {
                  setSummaryText('problem loading summary');
                }
              }}
            />

            <Text selectable style={styles.result}>
              {summaryText}
            </Text>
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
