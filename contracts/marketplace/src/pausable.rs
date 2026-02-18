multiversx_sc::imports!();

#[multiversx_sc::module]
pub trait PausableModule {
    #[storage_mapper("is_paused")]
    fn is_paused(&self) -> SingleValueMapper<bool>;

    #[only_owner]
    #[endpoint(pause)]
    fn pause(&self) {
        self.is_paused().set(true);
    }

    #[only_owner]
    #[endpoint(unpause)]
    fn unpause(&self) {
        self.is_paused().set(false);
    }

    fn require_not_paused(&self) {
        require!(!self.is_paused().get(), "Contract is paused");
    }
}
