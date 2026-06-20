module sndguard::credential {
    use std::string::String;
    use sui::event;

    public struct MemoryCredential has key, store {
        id: sui::object::UID,
        memory_id: String,
        content_hash: String,
        trust_score: u64,
        status: u8,
    }

    public struct CredentialIssued has copy, drop {
        memory_id: String,
        content_hash: String,
        object_id: sui::object::ID,
    }

    public struct CredentialRevoked has copy, drop {
        memory_id: String,
        object_id: sui::object::ID,
    }

    public struct MemoryPoisonDetected has copy, drop {
        memory_id: String,
        confidence: u64,
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
        let memory_id_str = std::string::utf8(memory_id);
        let content_hash_str = std::string::utf8(content_hash);
        let credential = MemoryCredential {
            id: sui::object::new(ctx),
            memory_id: memory_id_str,
            content_hash: content_hash_str,
            trust_score,
            status: STATUS_ACTIVE,
        };
        let object_id = sui::object::id(&credential);
        event::emit(CredentialIssued {
            memory_id: memory_id_str,
            content_hash: content_hash_str,
            object_id,
        });
        sui::transfer::share_object(credential);
    }

    public entry fun issue_entry(
        memory_id: vector<u8>,
        content_hash: vector<u8>,
        trust_score: u64,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        issue(memory_id, content_hash, trust_score, ctx);
    }

    public fun revoke(credential: &mut MemoryCredential) {
        let object_id = sui::object::id(credential);
        let memory_id = credential.memory_id;
        credential.status = STATUS_REVOKED;
        credential.trust_score = 0;
        event::emit(CredentialRevoked {
            memory_id,
            object_id,
        });
    }

    public entry fun revoke_entry(credential: &mut MemoryCredential) {
        revoke(credential);
    }

    public entry fun emit_poison_detected(memory_id: vector<u8>, confidence: u64) {
        event::emit(MemoryPoisonDetected {
            memory_id: std::string::utf8(memory_id),
            confidence,
        });
    }

    public fun trust_score(credential: &MemoryCredential): u64 {
        credential.trust_score
    }

    public fun status(credential: &MemoryCredential): u8 {
        credential.status
    }
}
