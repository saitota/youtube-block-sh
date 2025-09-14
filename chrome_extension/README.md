# YouTube Kids Channel Blocker

YouTube Kidsの監視対象アカウント向けチャンネルブロック拡張機能

## 機能

- YouTubeページから右クリックでチャンネルをブロック
- 複数のKidsアカウントを管理
- 親のChromeからの自動ヘッダー取得、または手動入力に対応
- シンプルな操作ログ表示

## セットアップ

1. 拡張機能アイコンをクリックして設定を開く
2. Kids Account IDsを追加
3. 認証設定:
   - 親のChrome: "Parent's Chrome"をチェック（自動取得）
   - 子のChrome: AuthorizationとCookieを手動入力

## 認証ヘッダーの取得方法

1. Chrome DevTools (F12) → Networkタブを開く
2. YouTube Kidsで任意のチャンネルを手動でブロック
3. `update_blacklist`へのリクエストを探す
4. AuthorizationヘッダーとCookie値をコピー

## 使い方

1. YouTubeのチャンネル/動画ページへ移動
2. 右クリック → "Block this channel for Kids"
3. 通知で結果を確認
4. 設定画面でログを確認

## API詳細

- エンドポイント: `https://www.youtube.com/youtubei/v1/kids/update_blacklist`
- メソッド: POST
- 必須ヘッダー: Authorization, Cookie, X-Goog-AuthUser, X-Origin
- リクエストボディ: clientName, clientVersion, externalChannelId, action, kidGaiaId

## トラブルシューティング

### リクエストが失敗する場合

以下のGoプログラムの該当箇所を参照してください：

1. **401エラー（認証失敗）**
   - `cmd/main.go:154-157` - エラーハンドリング
   - `cmd/main.go:56-64` - 環境変数のチェック
   - 原因: AuthorizationまたはCookieの期限切れ

2. **チャンネルIDが取得できない**
   - `cmd/main.go:77-96` - GetChannelID関数
   - `cmd/main.go:89` - 正規表現パターン
   - 原因: YouTubeページ構造の変更

3. **リクエストボディの構造エラー**
   - `cmd/main.go:33-45` - UpdateBlacklistRequest構造体
   - `cmd/main.go:101-126` - リクエストボディの構築
   - 原因: API仕様の変更

4. **ヘッダー設定の問題**
   - `cmd/main.go:140-145` - ヘッダー設定
   - 特に重要: X-Goog-AuthUser, X-Origin

5. **定数の確認**
   - `cmd/main.go:17-24` - API関連の定数
   - clientVersion等が古い可能性

## ファイル構成

```
chrome_extension/
├── manifest.json           # 拡張機能設定
├── background.js           # バックグラウンド処理
├── content.js             # YouTubeページ処理
├── settings.html          # 設定画面
├── settings.js            # 設定画面ロジック  
├── settings.css           # 設定画面スタイル
├── api.js                 # YouTube API通信
├── storage.js             # Chrome storage管理
└── icons/                 # アイコン（要PNGファイル）
```

## 開発メモ

- Goプログラムの実装ロジックは `../cmd/main.go` に集約
- 認証情報の取得は `../gen_export.sh` を参考
- テスト時は `../curl.sample.txt` のリクエスト形式を確認