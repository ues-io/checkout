import { AfterSaveBotApi } from "@uesio/bots"

function checkout(bot: AfterSaveBotApi) {
	bot.updates.get().forEach(function (change) {
		if (
			change.get("ben/checkout.status") === "SUBMITTED" &&
			change.getOld("ben/checkout.status") !== "SUBMITTED"
		) {
			const items = bot.load({
				collection: "ben/checkout.orderitem",
				conditions: [
					{
						field: "ben/checkout.order",
						value: change.get("uesio/core.id"),
					},
				],
				fields: [
					{
						id: "ben/checkout.name",
					},
					{
						id: "ben/checkout.quantity",
					},
					{
						id: "ben/checkout.price",
					},
				],
			})
			const result = bot.asAdmin.runIntegrationAction(
				"ben/checkout.stripe",
				"checkout",
				{
					items: items.map((item) => ({
						name: item["ben/checkout.name"],
						quantity: item["ben/checkout.quantity"],
						price: item["ben/checkout.price"],
					})),
					successURL:
						change.get("ben/checkout.success_url") ||
						change.getOld("ben/checkout.success_url"),
				}
			)
			bot.save("ben/checkout.order", [
				{
					"uesio/core.id": change.get("uesio/core.id"),
					"ben/checkout.checkout_url": result,
				},
			])
			log(result)
		}
	})
}
