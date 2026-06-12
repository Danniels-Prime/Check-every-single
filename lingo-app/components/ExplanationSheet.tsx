import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S } from '../constants/theme';
import type { Explanation } from '../types';

const TYPE_COLOR: Record<string,string> = {
  idiom:'#7B2FFF',slang:'#FF3B5C',phrase:'#0DFFD4',
  word:C.accent,abbreviation:'#FF9F1C',expression:'#00AAFF',
};

interface Props {
  visible:  boolean;
  term:     string;
  state:    { phase:string; data?:Explanation; message?:string; term?:string };
  onClose:  () => void;
}

export function ExplanationSheet({ visible, term, state, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet,{paddingBottom:insets.bottom+16}]}>
          <View style={styles.handle} />
          {state.phase==='loading' && (
            <View style={styles.center}>
              <ActivityIndicator color={C.accent} size="large" />
              <Text style={styles.loadingTxt}>Looking up “{term}”…</Text>
            </View>
          )}
          {state.phase==='error' && (
            <View style={styles.center}>
              <Text style={{fontSize:36,marginBottom:12}}>⚠️</Text>
              <Text style={styles.errorTxt}>{state.message}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeBtnTxt}>Close</Text></TouchableOpacity>
            </View>
          )}
          {state.phase==='done' && state.data && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.termRow}>
                <Text style={styles.termTxt}>{state.data.term}</Text>
                <View style={[styles.badge,{backgroundColor:(TYPE_COLOR[state.data.type]??C.accent)+'22',borderColor:TYPE_COLOR[state.data.type]??C.accent}]}>
                  <Text style={[styles.badgeTxt,{color:TYPE_COLOR[state.data.type]??C.accent}]}>{state.data.type}</Text>
                </View>
              </View>
              <Section label="📖 MEANING"><Text style={styles.bodyTxt}>{state.data.definition}</Text></Section>
              <Section label="💬 USAGE"><Text style={styles.bodyTxt}>{state.data.usage}</Text></Section>
              <Section label="📝 EXAMPLES">
                {state.data.examples.map((ex,i)=>(
                  <View key={i} style={styles.exRow}>
                    <Text style={styles.exBullet}>›</Text>
                    <Text style={styles.exTxt}>“{ex}”</Text>
                  </View>
                ))}
              </Section>
              {state.data.culturalNote ? <Section label="🌎 CULTURAL NOTE"><Text style={styles.bodyTxt}>{state.data.culturalNote}</Text></Section> : null}
              <TouchableOpacity style={styles.doneBtn} onPress={onClose}><Text style={styles.doneTxt}>Got it</Text></TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Section({label,children}:{label:string;children:React.ReactNode}) {
  return <View style={{marginBottom:20}}><Text style={styles.secLabel}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.6)'},
  sheet:{backgroundColor:C.bgElevated,borderTopLeftRadius:R.xl,borderTopRightRadius:R.xl,paddingTop:12,paddingHorizontal:20,maxHeight:'85%',borderTopWidth:1,borderColor:C.borderAccent},
  handle:{width:40,height:4,backgroundColor:C.border,borderRadius:2,alignSelf:'center',marginBottom:20},
  center:{alignItems:'center',paddingVertical:40},
  loadingTxt:{marginTop:16,fontFamily:F.body,fontSize:15,color:C.textSub},
  errorTxt:{fontFamily:F.body,fontSize:15,color:C.textSub,textAlign:'center',marginBottom:20},
  termRow:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:20},
  termTxt:{fontSize:26,fontFamily:F.bodyBold,color:C.text,flex:1},
  badge:{paddingHorizontal:10,paddingVertical:4,borderRadius:R.full,borderWidth:1},
  badgeTxt:{fontSize:12,fontFamily:F.mono,letterSpacing:0.5},
  secLabel:{fontSize:11,fontFamily:F.mono,color:C.textDim,letterSpacing:1.5,marginBottom:8},
  bodyTxt:{fontSize:15,fontFamily:F.body,color:C.textSub,lineHeight:22},
  exRow:{flexDirection:'row',gap:8,marginBottom:6},
  exBullet:{fontSize:18,color:C.accent,marginTop:-1},
  exTxt:{flex:1,fontSize:14,fontFamily:F.body,color:C.textSub,lineHeight:22,fontStyle:'italic'},
  doneBtn:{backgroundColor:C.accentDim,borderWidth:1,borderColor:C.accent,borderRadius:R.lg,paddingVertical:14,alignItems:'center',marginTop:8,marginBottom:16},
  doneTxt:{fontSize:16,fontFamily:F.bodySemi,color:C.accent},
  closeBtn:{backgroundColor:C.bgHighlight,borderRadius:R.md,paddingVertical:12,paddingHorizontal:24},
  closeBtnTxt:{fontSize:15,fontFamily:F.bodySemi,color:C.textSub},
});
