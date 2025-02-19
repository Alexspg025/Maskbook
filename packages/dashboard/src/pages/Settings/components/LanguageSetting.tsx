/* eslint-disable @dimensiondev/unicode/specific-set */
import { MenuItem } from '@mui/material'
import { useLanguage } from '../../Personas/api.js'
import { Services } from '../../../API.js'
import SettingSelect from './SettingSelect.js'
import { LanguageOptions } from '@masknet/public-api'
import { useDashboardI18N } from '../../../locales/index.js'

export default function LanguageSetting() {
    const lang = useLanguage()
    const handleChange = (event: any) => {
        Services.Settings.setLanguage(event.target.value)
    }
    const t = useDashboardI18N()

    return (
        <SettingSelect value={lang} onChange={handleChange}>
            <MenuItem value={LanguageOptions.__auto__}>{t.settings_language_auto()}</MenuItem>
            <MenuItem value={LanguageOptions.enUS}>English</MenuItem>
            <MenuItem value={LanguageOptions.zhCN}>简体中文</MenuItem>
            <MenuItem value={LanguageOptions.zhTW}>繁体中文</MenuItem>
            <MenuItem value={LanguageOptions.jaJP}>日本語</MenuItem>
            <MenuItem value={LanguageOptions.koKR}>한국인</MenuItem>
        </SettingSelect>
    )
}
