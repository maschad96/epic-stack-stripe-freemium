import { json, type DataFunctionArgs } from '@remix-run/node'

import Stripe from 'stripe'
import {
	handleSubscriptionCreated,
	handleSubscriptionDeleted,
	handleSubscriptionUpdated,
} from '#app/utils/stripe.server.ts'

export async function action({ request, context }: DataFunctionArgs) {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405 })
	}

	const sig = request.headers.get('Stripe-Signature') ?? ''
	let event

	const stripeWebhookSecret = context.STRIPE_WEBHOOK_SECRET as string
	if (!stripeWebhookSecret) {
		console.error('The STRIPE_WEBHOOK_SECRET environment variable is not set.')
		return new Response('Server configuration error', { status: 500 })
	}

	const stripe = new Stripe(context.STRIPE_SECRET_KEY as string, {
		apiVersion: '2023-10-16',
	})

	try {
		const body = await request.text()
		event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret)
	} catch (err: any) {
		console.error(`Error in webhook signature verification: ${err.message}`)
		return new Response(`Webhook Error: ${err.message}`, { status: 400 })
	}

	try {
		switch (event.type) {
			case 'customer.subscription.created':
				await handleSubscriptionCreated(event.data.object, request, context)
				break
			case 'customer.subscription.updated':
				await handleSubscriptionUpdated(event.data.object, context)
				break
			case 'customer.subscription.deleted':
				await handleSubscriptionDeleted(event.data.object, context)
				break
			default:
				console.warn(`Unhandled event type: ${event.type}`)
				return new Response(`Unhandled event type ${event.type}`, {
					status: 400,
				})
		}
	} catch (err: any) {
		console.error(`Error handling webhook event: ${err.message}`)
		return new Response(`Webhook handler error: ${err.message}`, {
			status: 400,
		})
	}

	return new Response(null, { status: 200 })
}

export async function loader({ request }: DataFunctionArgs) {
	return json({ received: true })
}
