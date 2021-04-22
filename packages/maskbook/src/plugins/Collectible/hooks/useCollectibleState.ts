import { useRef, useState } from 'react'
import { createContainer } from 'unstated-next'
import { OrderSide } from 'opensea-js/lib/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { currentCollectibleProviderSettings } from '../settings'
import { CollectibleTab, CollectibleToken } from '../types'
import { useAsset } from './useAsset'
import { useOrders } from './useOrders'
import { useEvents } from './useEvents'
import { useUpdateEffect } from 'react-use'

function useCollectibleState(token?: CollectibleToken) {
    const [tabIndex, setTabIndex] = useState(CollectibleTab.ARTICLE)

    const provider = useValueRef(currentCollectibleProviderSettings)
    const asset = useAsset(provider, token)

    const [offerPage, setOfferPage] = useState(0)
    const offers = useOrders(provider, tabIndex === CollectibleTab.OFFER ? token : undefined, OrderSide.Buy, offerPage)

    const [orderPage, setOrderPage] = useState(0)
    const orders = useOrders(
        provider,
        tabIndex === CollectibleTab.LISTING ? token : undefined,
        OrderSide.Sell,
        orderPage,
    )

    const [eventPage, setEventPage] = useState(0)
    const cursors = useRef<string[]>([])
    const events = useEvents(
        provider,
        tabIndex === CollectibleTab.HISTORY ? token : undefined,
        cursors.current[eventPage - 1],
    )

    useUpdateEffect(() => {
        if (
            events.value &&
            events.value.pageInfo.endCursor &&
            !cursors.current.some((item) => events.value && item === events.value.pageInfo.endCursor)
        ) {
            cursors.current.push(events.value.pageInfo.endCursor)
        }
    }, [events, cursors])

    if (process.env.NODE_ENV === 'development') {
        console.log('DEBUG: collectible')
        console.log({
            provider,
            asset,
            orders,
            offers,
            events,
        })
    }

    return {
        token,
        asset,
        provider,

        tabIndex,
        setTabIndex,

        offers,
        offerPage,
        setOfferPage,

        orders,
        orderPage,
        setOrderPage,

        events,
        eventPage,
        setEventPage,
    }
}

export const CollectibleState = createContainer(useCollectibleState)
