import React, { useEffect, useRef } from 'react';

export default function RakutenWidget({ size, ts }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // クリーンアップ (多重描画防止)
    containerRef.current.innerHTML = '';

    // 広告用のプレミアム外枠 div
    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-block';
    wrapper.style.background = 'rgba(255, 255, 255, 0.02)';
    wrapper.style.border = '1px solid var(--border-color)';
    wrapper.style.borderRadius = '12px';
    wrapper.style.padding = '8px';
    wrapper.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    
    // 設定用のスクリプトタグを生成
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      rakuten_design="slide";
      rakuten_affiliateId="13d7e480.d3ca8031.13d7e481.fbbf2c18";
      rakuten_items="ctsmatch";
      rakuten_genreId="0";
      rakuten_size="${size}";
      rakuten_target="_blank";
      rakuten_theme="gray";
      rakuten_border="off";
      rakuten_auto_mode="on";
      rakuten_genre_title="off";
      rakuten_recommend="on";
      rakuten_ts="${ts}";
    `;

    // 読み込み・実行用のスクリプトタグを生成
    const widgetScript = document.createElement('script');
    widgetScript.type = 'text/javascript';
    widgetScript.src = 'https://xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js?20230106';

    // ラッパーにスクリプトを追加
    wrapper.appendChild(configScript);
    wrapper.appendChild(widgetScript);

    // コンテナにアペンド
    containerRef.current.appendChild(wrapper);
  }, [size, ts]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        margin: '24px 0', 
        width: '100%' 
      }} 
    />
  );
}
