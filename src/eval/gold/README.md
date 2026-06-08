# Gold set

Hand-labelled ground truth. This is the most valuable asset in the project — the
model and prompt change, the gold set is what keeps you honest.

## How to grow it

1. Drop public German/Swiss decisions in (sources below), 20–30 documents.
2. For each, read it yourself and fill in the `expected` block by hand.
3. Re-run `pnpm eval` after every prompt/model change and watch the numbers.

## Encoding

- `parties`: `"name|role"` where role ∈ `Klaeger|Beklagter|Gericht|Anwalt|Sonstiges`
- `deadlines`: `"description|date"` (date = ISO or empty if none stated)
- `claimAmount`: `"<amount> <currency>"` or `null`

## Public sources (no PII, safe to commit)

- https://www.rechtsprechung-im-internet.de  (federal courts)
- https://openjur.de                          (large open corpus)
- https://entscheidsuche.ch                   (Swiss decisions)
