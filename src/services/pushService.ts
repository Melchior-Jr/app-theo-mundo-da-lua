import { supabase } from '@/lib/supabase'

const PUBLIC_VAPID_KEY = 'BO0dglirrtm6PIh5p2XlGz1oi6jUFW3SK-z05tu_aC2-7pOc1yubRoMhG5-r1Xe6cmXDw1j4FcYOvS4HwJzpo5U'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const PushService = {

  /**
   * Registro do Service Worker & Solicitação de Permissão
   */
  async register(userId: string): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push não suportado neste navegador 🛸')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      // Aguarda o Service Worker ficar pronto
      await navigator.serviceWorker.ready
      
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        return this.subscribe(registration, userId)
      }
      return false
    } catch (e) {
      console.error('Falha ao registrar push:', e)
      return false
    }
  },

  /**
   * Assinar para notificações com as chaves VAPID
   */
  async subscribe(registration: ServiceWorkerRegistration, userId: string): Promise<boolean> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      })

      // Extrair chaves para o Supabase
      const subJSON = JSON.parse(JSON.stringify(subscription))
      const { endpoint, keys } = subJSON

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: navigator.userAgent
        }, { onConflict: 'endpoint' });

      if (error) throw error;
      console.log('Foguete assinado para notificações! 🚀');
      return true;
    } catch (e) {
      console.error('Falha ao assinar:', e);
      return false;
    }
  },

  /**
   * Busca e salva preferências do usuário
   */
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSettings(userId: string, settings: any) {
    const { error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
}
