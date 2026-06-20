module sndguard::credential {
    use std::string::String;

    public struct MemoryCredential has key, store {
        id: sui::object::UID,
        memory_id: String,
        content_hash: String,
        trust_score: u64,
        status: u8,
    }

    const STATUS_ACTIVE: u8 = 0;
    const STATUS_SUSPICIOUS: u8 = 1;
    const STATUS_REVOKED: u8 = 2;

    public fun issue(
        memory_id: vector<u8>,
        content_hash: vector<u8>,
        trust_score: u64,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        let credential = MemoryCredential {
            id: sui::object::new(ctx),
            memory_id: std::string::utf8(memory_id),
            content_hash: std::string::utf8(content_hash),
            trust_score,
            status: STATUS_ACTIVE,
        };
        sui::transfer::share_object(credential);
    }

    public fun revoke(credential: &mut MemoryCredential) {
        credential.status = STATUS_REVOKED;
        credential.trust_score = 0;
    }

    public fun trust_score(credential: &MemoryCredential): u64 {
        credential.trust_score
    }

    public fun status(credential: &MemoryCredential): u8 {
        credential.status
    }
}
