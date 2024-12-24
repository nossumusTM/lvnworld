'use client'

import { wagmiAdapter, projectId } from "../config"
import { createAppKit } from "@reown/appkit"
import { mainnet } from '@reown/appkit/networks'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const queryClient = new QueryClient()

if(!projectId) {
    throw new Error('ProjectId is not defined')
}

const metadata = {
    name: 'Krashbox',
    description: 'Crash, collect and cash-out',
    url: 'https://krashbox.world',
    icons: ['https://nossumus.com/public/images/krashbox32x32.png']
}

const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet],
    defaultNetwork: mainnet,
    features: {
        analytics: true,
        email: false,
        socials: false,
        emailShowWallets: true
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-font-family': 'Orbitron, sans-serif',
        '--w3m-accent': '00FF000',
        '--w3m-border-radius-master': '10px'
    }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider