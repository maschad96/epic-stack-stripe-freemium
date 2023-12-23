import Stripe from 'stripe'

import { prisma } from './db.server.ts'

export async function handleSubscriptionCreated(
	subscription: Stripe.Subscription,
	request: Request,
	context: any,
) {
	const stripe = new Stripe(context.STRIPE_SECRET_KEY, {
		apiVersion: '2023-10-16',
	})

	try {
		const customer = (await stripe.customers.retrieve(
			subscription.customer as string,
		)) as Stripe.Customer

		let user = await prisma.user.findUnique({
			where: { email: customer.email as string },
		})

		if (user) {
			await prisma.user.update({
				where: { id: user.id },
				data: {
					stripeCustomerId: customer.id,
					stripeSubscriptionId: subscription.id,
					stripePriceId: subscription.items.data[0].price.id,
					stripeSubscriptionStatus: subscription.status,
					stripeSubscriptionStart: new Date(
						subscription.current_period_start * 1000,
					),
					stripeSubscriptionEndOrRenew: new Date(
						subscription.current_period_end * 1000,
					),
				},
			})
		}
	} catch (error) {
		throw error
	}
}

export async function handleSubscriptionUpdated(
	subscription: Stripe.Subscription,
	context: any,
) {
	try {
		await prisma.user.update({
			where: { stripeSubscriptionId: subscription.id },
			data: {
				stripeSubscriptionStatus: subscription.status,
				stripeSubscriptionStart: new Date(
					subscription.current_period_start * 1000,
				),
				stripeSubscriptionEndOrRenew: new Date(
					subscription.current_period_end * 1000,
				),
			},
		})
	} catch (error) {
		console.error('Error handling subscription update:', error)
		throw error
	}
}

export async function handleSubscriptionDeleted(
	subscription: Stripe.Subscription,
	context: any,
) {
	try {
		await prisma.user.update({
			where: { stripeSubscriptionId: subscription.id },
			data: {
				stripeSubscriptionStatus: 'cancelled',
			},
		})
	} catch (error) {
		console.error('Error handling subscription deletion:', error)
		throw error
	}
}
