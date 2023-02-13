import { toast } from '@zerodevx/svelte-toast'

const toastConfig = {
    "success": {
        '--toastColor': 'mintcream',
        '--toastBackground': 'rgba(72,187,120,0.9)',
        '--toastBarBackground': '#2F855A'
    },
    "error": {
        '--toastColor': 'yellow',
        '--toastBackground': 'darkred',
        '--toastBarBackground': 'darkred'
    }
}
type Toast  = {
    toastTitle: string
    toastType: keyof typeof toastConfig
}

export const showToast = (result?: Toast) => {
    if (!result) return;

    toast.push(result.toastTitle, { theme: toastConfig[result.toastType] })
}