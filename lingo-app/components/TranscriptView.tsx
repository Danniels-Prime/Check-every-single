import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { C, F } from '../constants/theme';
import type { TranscriptSegment } from '../types';

interface Props {
  segments:    TranscriptSegment[];
  interimText: string;
  onWordPress: (word: string, context: string) => void;
  scrollRef?:  React.RefObject<ScrollView>;
}

export function TranscriptView({ segments, interimText, onWordPress, scrollRef }: Props) {
  if (segments.length === 0 && !interimText) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🎤</Text>
        <Text style={styles.emptyTitle}>Tap the mic to start</Text>
        <Text style={styles.emptySub}>Speak — tap any word or phrase{`\n`}to get an instant explanation</Text>
      </View>
    );
  }
  return (
    <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}
      onContentSizeChange={() => scrollRef?.current?.scrollToEnd({animated:true})}>
      {segments.map((seg) => {
        const segText = seg.tokens.map((t)=>t.text).join('');
        return (
          <View key={seg.id} style={styles.segRow}>
            {seg.tokens.map((tok) =>
              tok.isWord ? (
                <TouchableOpacity key={tok.id} activeOpacity={0.6}
                  onPress={()=>onWordPress(tok.text,segText)} style={styles.wordBtn}>
                  <Text style={styles.word}>{tok.text}</Text>
                </TouchableOpacity>
              ) : (
                <Text key={tok.id} style={styles.punct}>{tok.text}</Text>
              )
            )}
          </View>
        );
      })}
      {interimText ? <View style={styles.segRow}><Text style={styles.interim}>{interimText}</Text></View> : null}
      <View style={{height:20}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:{flex:1},content:{padding:20,paddingBottom:8},
  segRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'flex-end',marginBottom:6},
  wordBtn:{marginRight:2,marginBottom:4},
  word:{fontSize:20,lineHeight:30,fontFamily:F.bodySemi,color:C.text,paddingHorizontal:2,borderBottomWidth:1,borderBottomColor:C.textDim},
  punct:{fontSize:20,lineHeight:30,fontFamily:F.body,color:C.textSub},
  interim:{fontSize:18,lineHeight:28,fontFamily:F.body,color:C.textDim,fontStyle:'italic'},
  empty:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:32},
  emptyIcon:{fontSize:52,marginBottom:16},
  emptyTitle:{fontSize:20,fontFamily:F.bodySemi,color:C.textSub,marginBottom:10,textAlign:'center'},
  emptySub:{fontSize:15,fontFamily:F.body,color:C.textDim,textAlign:'center',lineHeight:22},
});
