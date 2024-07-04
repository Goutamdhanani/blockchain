"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    tostring() {
        return JSON.stringify(this);
    }
}
class block {
    constructor(prevHash, transaction, ts = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = Math.round(Math.random() * 999999999);
    }
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto_1.default.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}
class Chain {
    constructor() {
        this.chain = [
            new block('', new Transaction(100, 'genesis', 'satoshi'))
        ];
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    mine(nonce) {
        let solution = 1;
        console.log("⛏️  mining...");
        while (true) {
            const hash = crypto_1.default.createHash('MD5');
            hash.update((nonce + solution).toString()).end();
            const attempt = hash.digest('hex');
            if (attempt.substr(0, 4) == '0000') {
                console.log(`solved: ${solution}`);
                return solution;
            }
            solution += 1;
        }
    }
    addBlock(transaction, senderPublicKey, signature) {
        const verify = crypto_1.default.createVerify('SHA256');
        verify.update(transaction.tostring());
        const isValid = verify.verify(senderPublicKey, signature);
        if (isValid) {
            const newBlock = new block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }
}
Chain.instance = new Chain();
class Wallet {
    constructor() {
        const keypair = crypto_1.default.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto_1.default.createSign('SHA256');
        sign.update(transaction.tostring()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
// Example usage

const goutam = new Wallet();
const Pj = new Wallet();
goutam.sendMoney(100, Pj.publicKey);




console.log(Chain.instance);
