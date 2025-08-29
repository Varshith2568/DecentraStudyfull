# DecentraStudy

A minimal Decentralized Study Notes project with:
- Clarity smart contract (`contracts/decentra-study.clar`)
- Clarinet test (`tests/decentra-study_test.ts`)
- Frontend (`frontend/index.html`, `frontend/app.js`)

## How to run

### Requirements
- Clarinet (https://github.com/clarete/clarinet) installed
- Node / npm for frontend (optional) or simply open `frontend/index.html` in a browser

### Run Clarinet tests
From project root:
```
clarinet test
```

### Notes
- The frontend currently simulates IPFS uploads and contract calls so you can test the UI immediately.
- Replace simulation code in `frontend/app.js` with actual Stacks.js calls:
  - use `@stacks/transactions` and `@stacks/connect` to call `add-note` and `vote-note`.
  - use `callReadOnlyFunction` to call `get-note` and `has-voted` for accurate state.