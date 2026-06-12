import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSettings, saveSettings } from '../../lib/storage';
import { C, F, R, S } from '../../constants/theme';
import type { AppSettings, Language } from '../../types';

const LANGS: {code:Language;name:string}[] = [
  {code:'en',name:'English (default)'},{code:'es',name:'Spanish'},{code:'fr',name:'French'},
  {code:'de',name:'German'},{code:'pt',name:'Portuguese'},{code:'ru',name:'Russian'},
  {code:'zh',name:'Chinese'},{code:'ja',name:'Japanese'},{code:'ar',name:'Arabic'},
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings>({ deepgramApiKey:'', claudeApiKey:'', defaultLanguage:'en', hapticFeedback:true });
  const [saved, setSaved] = useState(false);
  useEffect(() => { getSettings().then(setSettings); }, []);

  const handleSave = async () => { await saveSettings(settings); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.header,{paddingTop:insets.top+4}]}><Text style={styles.title}>SETTINGS</Text></View>

          <View style={styles.section}>
            <Text style={styles.label}>DEEPGRAM API KEY</Text>
            <Text style={styles.hint}>Real-time transcription · console.deepgram.com</Text>
            <TextInput value={settings.deepgramApiKey} onChangeText={(v)=>setSettings(s=>({...s,deepgramApiKey:v}))}
              placeholder="dg_••••••••••••••" placeholderTextColor={C.textDim}
              secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>CLAUDE API KEY</Text>
            <Text style={styles.hint}>Word explanations · console.anthropic.com</Text>
            <TextInput value={settings.claudeApiKey} onChangeText={(v)=>setSettings(s=>({...s,claudeApiKey:v}))}
              placeholder="sk-ant-••••••••••••••" placeholderTextColor={C.textDim}
              secureTextEntry autoCapitalize="none" autoCorrect={false} style={styles.input} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>DEFAULT LANGUAGE</Text>
            <View style={styles.langGrid}>
              {LANGS.map((l)=>(
                <TouchableOpacity key={l.code} onPress={()=>setSettings(s=>({...s,defaultLanguage:l.code}))}
                  style={[styles.langBtn,settings.defaultLanguage===l.code&&styles.langBtnActive]}>
                  <Text style={[styles.langTxt,settings.defaultLanguage===l.code&&styles.langTxtActive]}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.privacy}><Text style={styles.privacyTxt}>🔒  API keys stored on-device only — never sent anywhere except the respective APIs.</Text></View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveTxt}>{saved?'✓ Saved!':'Save Settings'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},scroll:{padding:S.md,paddingBottom:40},
  header:{marginBottom:S.lg},title:{fontFamily:F.monoBold,fontSize:20,color:C.accent,letterSpacing:3},
  section:{marginBottom:S.xl},label:{fontFamily:F.mono,fontSize:11,color:C.textDim,letterSpacing:1.5,marginBottom:6},
  hint:{fontFamily:F.body,fontSize:13,color:C.textDim,marginBottom:10},
  input:{backgroundColor:C.bgCard,borderWidth:1,borderColor:C.border,borderRadius:R.md,padding:14,color:C.text,fontFamily:F.mono,fontSize:14},
  langGrid:{gap:8},
  langBtn:{backgroundColor:C.bgCard,borderRadius:R.md,padding:12,borderWidth:1,borderColor:C.border},
  langBtnActive:{borderColor:C.accent,backgroundColor:C.accentDim},
  langTxt:{fontFamily:F.body,fontSize:14,color:C.textSub},
  langTxtActive:{color:C.accent,fontFamily:F.bodySemi},
  privacy:{backgroundColor:C.bgCard,borderRadius:R.md,padding:S.md,marginBottom:S.xl,borderWidth:1,borderColor:C.border},
  privacyTxt:{fontFamily:F.body,fontSize:13,color:C.textDim,lineHeight:18},
  saveBtn:{backgroundColor:C.accent,borderRadius:R.lg,paddingVertical:16,alignItems:'center'},
  saveTxt:{fontFamily:F.bodyBold,fontSize:16,color:C.bg,letterSpacing:0.5},
});
