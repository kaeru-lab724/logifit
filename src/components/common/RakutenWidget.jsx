import React from 'react';

export default function RakutenWidget({ size = '300x160', ts = '1716892518451' }) {
  const [width, height] = size.split('x');

  // iframe内のHTMLコンテンツを構築
  const iframeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          background: transparent; 
          display: flex;
          justify-content: center;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <script type="text/javascript">
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
      </script>
      <script type="text/javascript" src="https://xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js?20230106"></script>
    </body>
    </html>
  `.trim();

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        margin: '24px 0', 
        width: '100%' 
      }}
    >
      <div
        style={{
          display: 'inline-block',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          lineHeight: 0,
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <iframe
          title={`rakuten-widget-${size}`}
          srcDoc={iframeHtml}
          width={width}
          height={height}
          style={{ border: 'none', background: 'transparent', maxWidth: '100%' }}
          scrolling="no"
        />
      </div>
    </div>
  );
}
