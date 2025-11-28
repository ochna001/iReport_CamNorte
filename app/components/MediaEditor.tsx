import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaEditorProps {
  visible: boolean;
  imageUri: string;
  onSave: (editedUri: string, hasBlur: boolean) => void;
  onCancel: () => void;
}

interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MediaEditor: React.FC<MediaEditorProps> = ({
  visible,
  imageUri,
  onSave,
  onCancel,
}) => {
  const [blurRegions, setBlurRegions] = useState<BlurRegion[]>([]);
  const [isAddingBlur, setIsAddingBlur] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<BlurRegion | null>(null);

  const handleImagePress = (event: any) => {
    if (!isAddingBlur) return;

    const { locationX, locationY } = event.nativeEvent;
    
    // Add a blur region at tap location
    const newRegion: BlurRegion = {
      x: locationX - 40,
      y: locationY - 40,
      width: 80,
      height: 80,
    };
    
    setBlurRegions([...blurRegions, newRegion]);
    setIsAddingBlur(false);
  };

  const removeLastBlur = () => {
    if (blurRegions.length > 0) {
      setBlurRegions(blurRegions.slice(0, -1));
    }
  };

  const clearAllBlurs = () => {
    setBlurRegions([]);
  };

  const handleSave = () => {
    // In a real implementation, we would process the image with blur applied
    // For now, we'll just pass back the original URI and a flag indicating blur was added
    onSave(imageUri, blurRegions.length > 0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Photo</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.saveButton]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleImagePress}
            style={styles.imageTouchable}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
            
            {/* Blur Overlay Regions */}
            {blurRegions.map((region, index) => (
              <View
                key={index}
                style={[
                  styles.blurRegion,
                  {
                    left: region.x,
                    top: region.y,
                    width: region.width,
                    height: region.height,
                  },
                ]}
              >
                <Text style={styles.blurText}>BLUR</Text>
              </View>
            ))}
          </TouchableOpacity>
          
          {isAddingBlur && (
            <View style={styles.instructionOverlay}>
              <Text style={styles.instructionText}>
                Tap on the area you want to blur (e.g., faces, license plates)
              </Text>
            </View>
          )}
        </View>

        {/* Tools */}
        <View style={styles.toolsContainer}>
          <Text style={styles.toolsTitle}>Privacy Tools</Text>
          
          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={[
                styles.toolButton,
                isAddingBlur && styles.toolButtonActive,
              ]}
              onPress={() => setIsAddingBlur(!isAddingBlur)}
            >
              <Text style={styles.toolIcon}>🔲</Text>
              <Text style={[
                styles.toolText,
                isAddingBlur && styles.toolTextActive,
              ]}>
                {isAddingBlur ? 'Tap Image' : 'Add Blur'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={removeLastBlur}
              disabled={blurRegions.length === 0}
            >
              <Text style={[styles.toolIcon, blurRegions.length === 0 && styles.toolDisabled]}>↩️</Text>
              <Text style={[styles.toolText, blurRegions.length === 0 && styles.toolDisabled]}>Undo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={clearAllBlurs}
              disabled={blurRegions.length === 0}
            >
              <Text style={[styles.toolIcon, blurRegions.length === 0 && styles.toolDisabled]}>🗑️</Text>
              <Text style={[styles.toolText, blurRegions.length === 0 && styles.toolDisabled]}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {blurRegions.length > 0 && (
            <Text style={styles.blurCount}>
              {blurRegions.length} blur region{blurRegions.length > 1 ? 's' : ''} added
            </Text>
          )}

          <Text style={styles.privacyNote}>
            💡 Tip: Blur faces, license plates, or other identifying information to protect privacy.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTouchable: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blurRegion: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurText: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  instructionOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  toolsContainer: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingBottom: 40,
  },
  toolsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  toolButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    minWidth: 80,
  },
  toolButtonActive: {
    backgroundColor: Colors.primary,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toolText: {
    color: '#fff',
    fontSize: 12,
  },
  toolTextActive: {
    fontWeight: '600',
  },
  toolDisabled: {
    opacity: 0.4,
  },
  blurCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  privacyNote: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MediaEditor;
