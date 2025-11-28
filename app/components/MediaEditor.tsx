import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaEditorProps {
  visible: boolean;
  imageUri: string;
  onSave: (editedUri: string, hasAnnotations: boolean) => void;
  onCancel: () => void;
}

type PenTool = 'blur' | 'red' | 'yellow' | 'arrow';

interface Stroke {
  path: string;
  color: string;
  strokeWidth: number;
  tool: PenTool;
}

interface BlurCircle {
  cx: number;
  cy: number;
  r: number;
}

const TOOL_COLORS: Record<PenTool, string> = {
  blur: 'rgba(0, 0, 0, 0.7)',
  red: '#ef4444',
  yellow: '#fbbf24',
  arrow: '#ef4444',
};

const MediaEditor: React.FC<MediaEditorProps> = ({
  visible,
  imageUri,
  onSave,
  onCancel,
}) => {
  const [selectedTool, setSelectedTool] = useState<PenTool>('blur');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [blurCircles, setBlurCircles] = useState<BlurCircle[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [brushSize, setBrushSize] = useState(20);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (selectedTool === 'blur') {
          // Add blur circle on tap
          setBlurCircles([...blurCircles, { cx: locationX, cy: locationY, r: brushSize }]);
        } else {
          setCurrentPath(`M${locationX},${locationY}`);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (selectedTool === 'blur') {
          // Add more blur circles while dragging
          setBlurCircles(prev => [...prev, { cx: locationX, cy: locationY, r: brushSize }]);
        } else {
          setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
        }
      },
      onPanResponderRelease: () => {
        if (selectedTool !== 'blur' && currentPath) {
          setStrokes([...strokes, {
            path: currentPath,
            color: TOOL_COLORS[selectedTool],
            strokeWidth: selectedTool === 'arrow' ? 4 : brushSize,
            tool: selectedTool,
          }]);
          setCurrentPath('');
        }
      },
    })
  ).current;

  const undo = () => {
    if (selectedTool === 'blur' && blurCircles.length > 0) {
      // Remove last 10 blur circles (approximate one stroke)
      setBlurCircles(prev => prev.slice(0, Math.max(0, prev.length - 10)));
    } else if (strokes.length > 0) {
      setStrokes(strokes.slice(0, -1));
    }
  };

  const clearAll = () => {
    setStrokes([]);
    setBlurCircles([]);
    setCurrentPath('');
  };

  const handleSave = () => {
    const hasAnnotations = strokes.length > 0 || blurCircles.length > 0;
    onSave(imageUri, hasAnnotations);
  };

  const hasContent = strokes.length > 0 || blurCircles.length > 0;

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

        {/* Image Container with Drawing Canvas */}
        <View style={styles.imageContainer} {...panResponder.panHandlers}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
          
          {/* SVG Drawing Layer */}
          <Svg style={styles.svgOverlay}>
            {/* Blur circles */}
            {blurCircles.map((circle, index) => (
              <Circle
                key={`blur-${index}`}
                cx={circle.cx}
                cy={circle.cy}
                r={circle.r}
                fill="rgba(0, 0, 0, 0.85)"
              />
            ))}
            
            {/* Drawn strokes */}
            {strokes.map((stroke, index) => (
              <Path
                key={`stroke-${index}`}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {/* Current drawing path */}
            {currentPath && selectedTool !== 'blur' && (
              <Path
                d={currentPath}
                stroke={TOOL_COLORS[selectedTool]}
                strokeWidth={selectedTool === 'arrow' ? 4 : brushSize}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>

        {/* Pen Tools */}
        <View style={styles.toolsContainer}>
          <Text style={styles.toolsTitle}>Drawing Tools</Text>
          
          {/* Tool Selection */}
          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={[styles.toolButton, selectedTool === 'blur' && styles.toolButtonActive]}
              onPress={() => setSelectedTool('blur')}
            >
              <View style={[styles.toolPreview, { backgroundColor: '#333' }]}>
                <Text style={styles.blurIcon}>◉</Text>
              </View>
              <Text style={[styles.toolText, selectedTool === 'blur' && styles.toolTextActive]}>
                Blur
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolButton, selectedTool === 'red' && styles.toolButtonActive]}
              onPress={() => setSelectedTool('red')}
            >
              <View style={[styles.toolPreview, { backgroundColor: TOOL_COLORS.red }]} />
              <Text style={[styles.toolText, selectedTool === 'red' && styles.toolTextActive]}>
                Red Pen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolButton, selectedTool === 'yellow' && styles.toolButtonActive]}
              onPress={() => setSelectedTool('yellow')}
            >
              <View style={[styles.toolPreview, { backgroundColor: TOOL_COLORS.yellow }]} />
              <Text style={[styles.toolText, selectedTool === 'yellow' && styles.toolTextActive]}>
                Highlight
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolButton, selectedTool === 'arrow' && styles.toolButtonActive]}
              onPress={() => setSelectedTool('arrow')}
            >
              <View style={styles.toolPreview}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
              <Text style={[styles.toolText, selectedTool === 'arrow' && styles.toolTextActive]}>
                Arrow
              </Text>
            </TouchableOpacity>
          </View>

          {/* Brush Size */}
          {selectedTool !== 'arrow' && (
            <View style={styles.sizeRow}>
              <Text style={styles.sizeLabel}>Size:</Text>
              {[10, 20, 30, 40].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeButton, brushSize === size && styles.sizeButtonActive]}
                  onPress={() => setBrushSize(size)}
                >
                  <View style={[styles.sizeDot, { width: size / 2, height: size / 2 }]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, !hasContent && styles.actionButtonDisabled]}
              onPress={undo}
              disabled={!hasContent}
            >
              <Text style={styles.actionIcon}>↩️</Text>
              <Text style={[styles.actionText, !hasContent && styles.actionTextDisabled]}>Undo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !hasContent && styles.actionButtonDisabled]}
              onPress={clearAll}
              disabled={!hasContent}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={[styles.actionText, !hasContent && styles.actionTextDisabled]}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Draw on the image to annotate or blur sensitive areas
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
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  toolsContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    paddingBottom: 40,
  },
  toolsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  toolButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    minWidth: 70,
  },
  toolButtonActive: {
    backgroundColor: Colors.primary,
  },
  toolPreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurIcon: {
    color: '#888',
    fontSize: 20,
  },
  arrowIcon: {
    color: TOOL_COLORS.red,
    fontSize: 20,
    fontWeight: 'bold',
  },
  toolText: {
    color: '#aaa',
    fontSize: 11,
  },
  toolTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sizeLabel: {
    color: '#888',
    fontSize: 12,
    marginRight: 8,
  },
  sizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#444',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  sizeDot: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
  },
  actionTextDisabled: {
    color: '#666',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default MediaEditor;
