import { Nft, TransferHistory } from "../generated/schema";
import { Transfer } from "../generated/HeroesToken/HeroesToken";
import {
  Address,
  BigInt,
  BigDecimal,
  Bytes,
  dataSource,
  ethereum,
  log
} from "@graphprotocol/graph-ts";

// import fetch from "node-fetch";

export function handleTransferERC721(event: Transfer): void {
  // log.info("handleTransferERC721: {}", [event.params.tokenId.toString()]);
  if (event.params && event.params.tokenId && event.address) {
    const nftExist = Nft.load(event.params.tokenId.toString() + "-" + event.address.toHex());
    if (nftExist) {
      nftExist.owner = event.params.to;
      nftExist.createdAtTimestamp = event.block.timestamp;
      nftExist.save();
    } else {
      const nft = new Nft(event.params.tokenId.toString() + "-" + event.address.toHex());
      nft.tokenID = event.params.tokenId;
      nft.tokenContract = event.address;
      nft.owner = event.params.to;
      nft.createdAtTimestamp = event.block.timestamp;

      nft.tokenURI = `https://character.heroesofnft.com/token/${nft.tokenID.toString()}`;

      //const erc721 = Erc721__factory.connect(event.address.toString(), api);
      //const tokenURI = await erc721.tokenURI(event.args.tokenId.toString());

      // nft.tokenURI = `https://character.heroesofnft.com/token/${nft.tokenID.toString()}`;
      // const response = await fetch(nft.tokenURI);

      // const data = await response.json();
      // // logger.info("NFT metadata: " + JSON.stringify(data));
      // nft.metadata = data;

      nft.save();
    }

    // History of transfer
    const transferHistory = new TransferHistory(
      event.params.tokenId.toString() +
        "-" +
        event.address.toHex() +
        "-" +
        event.block.timestamp.toString()
    );
    transferHistory.tokenID = event.params.tokenId;
    transferHistory.tokenContract = event.address;
    transferHistory.from = event.params.from;
    transferHistory.to = event.params.to;
    transferHistory.createdAtTimestamp = event.block.timestamp;
    transferHistory.save();
  }
}
