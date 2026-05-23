import Purchases, { LOG_LEVEL } from 'react-native-purchases'

export function configurePurchases() {
  Purchases.setLogLevel(LOG_LEVEL.ERROR)
  Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY! })
}

export async function loginPurchases(userId: string) {
  await Purchases.logIn(userId)
}

export async function logoutPurchases() {
  await Purchases.logOut()
}

export async function checkEntitlement(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo()
  const id = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID!
  return !!info.entitlements.active[id]
}
