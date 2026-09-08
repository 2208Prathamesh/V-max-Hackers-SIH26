# Multilingual Support Implementation Plan

## Context
The goal is to implement comprehensive multilingual support for WeatherGPT, allowing users to interact with the UI and the AI assistant in multiple Indian languages. The system should support UI localization and conversational weather language, with preferences persisted for authenticated users.

## Implementation Approach

### 1. UI Localization (Frontend)
- **Framework**: Install and configure `i18next`, `react-i18next`, and `i18next-browser-languagedetector`.
- **Structure**:
  - Create `frontend/src/i18n/i18n.js` for configuration.
  - Create locale files in `frontend/src/i18n/locales/`: `en.json`, `hi.json`, `mr.json`, `bn.json`, `ta.json`, `te.json`, `kn.json`, `gu.json`.
- **Translation**:
  - Extract all user-facing strings from components (Dashboard, Forecast, Alerts, Chat, Climate, Saved Locations, Settings, Auth) into the `en.json` file.
  - Provide translations for the other 7 languages.
  - Use the `useTranslation` hook (`t` function) to replace hardcoded strings.
- **Fallback**: Set English (`en`) as the fallback language.

### 2. Language Preference & Persistence
- **Backend**:
  - Reuse the existing `language` field in `backend/src/models/User.js`.
  - Implement/Verify an API endpoint to update the user's preferred language (e.g., `PATCH /api/users/language` or integrated into `settingsController.js`).
- **Frontend**:
  - Add a language selector dropdown in the Settings page.
  - On language change:
    1. Update `i18n.changeLanguage()`.
    2. If authenticated, call the backend API to persist the preference.
    3. If guest, save to `localStorage`.
  - On app load:
    1. Fetch preferred language from the user profile (if authenticated) or `localStorage`.
    2. Initialize `i18n` with this language.

### 3. Conversational Language (Backend)
- **Logic Update**: Modify `backend/src/services/chatService.js` to determine the response language.
  - **Priority**: Explicit User Preference (`user.language`) $\rightarrow$ Input Language Detection (`detectLanguage`) $\rightarrow$ Fallback (`en`).
- **AI Integration**:
  - Pass the resolved language to `generateGeminiWeatherResponse`.
  - The `geminiService.js` and `promptTemplates.js` already have basic support; I will ensure the `Target Output Language` is strictly enforced in the prompt.
- **Grounding**: Maintain the existing flow where the LLM explains verified data and does not invent numerical values.

### 4. Voice Compatibility
- **Update**: Modify `backend/src/controllers/voiceController.js` (and associated services) to pass the user's preferred language code to the STT (Speech-to-Text) and TTS (Text-to-Speech) engines.

### 5. Alerts Presentation
- **Layer**: Implement localization in the frontend `AlertsPage.jsx` and `AlertDetailsModal`.
- **Preservation**: Do not modify the original IMD alert data in MongoDB; only translate the presentation layer using `i18next`.

## Critical Files to Modify
- `frontend/package.json` (Add dependencies)
- `frontend/src/main.jsx` (Import i18n config)
- `frontend/src/i18n/i18n.js` (New)
- `frontend/src/i18n/locales/*.json` (New)
- `frontend/src/pages/SettingsPage.jsx` (Language selector)
- `frontend/src/pages/AlertsPage.jsx` (Localized strings)
- `backend/src/controllers/settingsController.js` or `userController.js` (Language update API)
- `backend/src/services/chatService.js` (Language resolution logic)
- `backend/src/controllers/voiceController.js` (Language config for voice)

## Verification Strategy
1. **UI Check**: Change language to Hindi/Marathi $\rightarrow$ Verify all labels, buttons, and messages translate.
2. **Persistence Check**: Change language $\rightarrow$ Reload page $\rightarrow$ Verify language persists.
3. **Auth Sync**: Login with user who has `language: 'hi'` $\rightarrow$ Verify UI automatically switches to Hindi.
4. **Chat Check**: 
   - Ask in English $\rightarrow$ English response.
   - Ask in Marathi (or with preference set to Marathi) $\rightarrow$ Marathi response.
   - Verify numerical values (temperature, etc.) are preserved correctly.
5. **Voice Check**: Use voice input/output $\rightarrow$ Verify it respects the selected language.
6. **Regression**: Verify Map, Forecast, and Dashboard functionality remain unchanged.
