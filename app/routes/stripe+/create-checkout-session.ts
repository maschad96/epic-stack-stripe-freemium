import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node'
import Stripe from 'stripe'

export let action: ActionFunction = async ({ request, context }) => {
	const stripeSecretKey = context.STRIPE_SECRET_KEY

	if (!stripeSecretKey) {
		throw new Error('The STRIPE_SECRET_KEY environment variable is not set.')
	}

	const stripe = new Stripe(stripeSecretKey as string, {
		apiVersion: '2023-10-16',
	})

	try {
		const { priceId } = (await request.json()) as { priceId: string }

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${new URL(request.url).origin}/?success=true`,
			cancel_url: `${new URL(request.url).origin}/?canceled=true`,
		})

		return json<{ id: string; checkoutUrl: string }>({
			id: session.id,
			checkoutUrl: session.url ?? '',
		})
	} catch (err: any) {
		return json(err.message, { status: err.statusCode || 500 })
	}
}

export const loader: LoaderFunction = () => {
	throw new Response('Not Found', { status: 404 })
}
