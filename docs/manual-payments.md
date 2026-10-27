# Manual payments

How to sell a Pro unlock by hand: bKash, a bank transfer, PayPal, cash — whatever
the buyer has. Nothing here needs a payment provider account, and nothing here
can be triggered by someone else: an admin has to move every step.

`PAYMENT_PROVIDER` set to `manual` (or unset in production, which resolves to
manual) is what puts a **Request Pro** form on a paid project page instead of a
Buy button. Apps are free to download; Pro is the unlock.

## The loop

1. **A request arrives.** The buyer fills in name, email, a note and how they
   want to pay. They land on `/order/<token>`: a private, noindex status page
   they can bookmark — no account, no password.
2. **You get in touch.** Open **Admin → Orders**, find the request, and agree a
   price and a method. Reply in whatever channel you already use.
3. **Record it.** Set **Agreed amount** and **Currency**, write a one-line
   **Note** ("bKash 8812, agreed ৳1500"), and move the status to **contacted**.
   The buyer's page updates as soon as you save.
4. **Wait for the money.** When it lands, move the status to **paid**.
5. **Generate the key.** On the same order row, press **Generate license key**
   with the type and device count you agreed. The key appears once on the
   licenses page; copy it from there.
6. **Send it.** Open **Message template** on the order and copy the WhatsApp,
   Telegram or email version. It already contains the amount, the key, the
   activation steps and the buyer's order link.
7. **The buyer activates.** Their app calls the API, the key binds to their
   device, and their order page shows the key with install steps forever.

A request that goes nowhere moves to **cancelled**. Nothing is deleted: the
history stays, and a cancelled order can be revived by setting it back to
`requested`.

## What the buyer sees

`https://your-domain.example/order/<token>` — a rail of *request received → in
contact → paid*, their details, the free download link, and, once you have
generated it, the key with a copy button and four activation steps. The token is
43 characters of base64url from 256 bits of randomness, stored only as an HMAC,
so the URL cannot be guessed and a database dump cannot be used to open one.
Anyone holding the link can read it; that is the trade for having no accounts.

## Generating a key

**Admin → Licenses → Generate a key**, or straight from the order.

| Field | What to pick |
| --- | --- |
| Projects | Tick the app(s) it unlocks. Tick nothing for a bundle that unlocks everything. |
| Type | `permanent`, or `timelimited`. |
| Days | For time-limited: `30`, `90`, `365`, or anything up to 3650. Counted from the **first activation**, not from today. |
| Activate before | Optional deadline for the first activation. Leave empty for "whenever they get to it". |
| Max devices | `2` by default. One laptop and one desktop is the usual answer. |
| Note | Buyer name, order, whatever helps you in six months. |

The key is shown once, with a copy button, and every viewing is written to the
audit trail. If you lose it, **Re-show key** decrypts it again — that is what the
encrypted copy is for.

## Renewing a time-limited key

**Admin → Licenses → Extend** with the number of extra days and press Extend.
The end date is `first activation + days`, so extending by 30 makes a key that
lapsed yesterday valid again for 31 days. The device slots and the audit trail
are untouched, and the app picks it up on its next verify.

A permanent key cannot be extended — it never expires. If you sold a permanent
key by mistake, revoke it and issue what you meant to sell.

## Revoking

**Admin → Licenses → Revoke**, with a reason. Revocation is checked on every
request, so the app stops working at its next verify — inside the grace window
at worst. A cached offline token keeps working until `graceUntil` (7 days by
default); that is the price of offline support.

**Un-revoke** puts it back. Useful for a false alarm.

## Devices

- A buyer who replaced a laptop: **Reset devices**. All slots are freed, the
  activation clock is *not* restarted, and their next activation takes a slot
  again.
- A buyer over the limit with no explanation: check the audit trail before
  resetting. Repeated resets on one key is usually a key being passed around.

## Refunds

There is no refund flow to speak of: revoke the key, set the order to
`cancelled`, and write the reason in the order notes. Both actions are recorded.

## Where the money went

This flow deliberately does not touch money. Whatever you use — bKash, a bank
app, PayPal, Wise — the record of the payment lives there, and the record of the
sale lives in **Admin → Orders**. Put the transaction id in the order notes so
the two can be matched.

## Checklist before the first sale

- [ ] `LICENSE_SECRET` and `LICENSE_TOKEN_PRIVATE_KEY` are set in Vercel
      (`node scripts/license-keys.mjs --write` writes them locally).
- [ ] The key that signed the local copy is backed up somewhere safe. Losing
      `LICENSE_SECRET` makes existing order links and keys unreadable.
- [ ] `ALLOWED_ORIGINS` lists the origins of any app that calls the API from a
      browser, including its `chrome-extension://` origin.
- [ ] The paid project has a price, a **Free download URL**, and is published.
- [ ] You have opened a test order, generated a key, activated it from the app,
      checked `/order/<token>`, and revoked it again.
