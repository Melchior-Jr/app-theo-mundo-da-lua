/**
 * Utilitários para compartilhamento e manipulação de URL
 */

/**
 * Retorna a URL de produção equivalente para qualquer URL atual
 */
export const getProductionUrl = (baseUrl?: string): string => {
  const current = baseUrl || window.location.href;
  return current.replace(
    /https?:\/\/(localhost:\d+|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:\d+|.*\.vercel\.app)/,
    'https://app.theonomundodalua.com'
  );
};

/**
 * Método de fallback clássico para copiar texto para o clipboard (funciona em ambientes HTTP/Não-Seguros)
 */
export const copyToClipboardFallback = (text: string): boolean => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Esconde o elemento da tela
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  
  textArea.focus();
  textArea.select();
  
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback Copy Error:', err);
    successful = false;
  }
  
  document.body.removeChild(textArea);
  return successful;
};
