import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import { TransactionStatus, TxHistory } from "../../types";
import { Layout } from "../../components/Layout";
import { SellerInput } from "../../components/SellerInput";
import { ImageType, MetaImage } from "../../components/MetaImage";
import { Metadata } from "../../schema/metadata";
import { getMetadata } from "../../web3/metaplex/metadataHelpers";
import { ItemInfo } from "../../components/ItemInfo";
import { database } from "../../firebase";
import { ref, get, query, equalTo, orderByChild } from "firebase/database";

export default function Detail() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [metadata, setMetadata] = useState<Metadata | undefined>(undefined);
  const [transaction, setTransaction] = useState<TxHistory | undefined>(
    undefined
  );
  const { sellerAddress, nft } = router.query;
  useEffect(() => {
    const fetchData = async () => {
      if (typeof nft !== "string") return;
      const nftPubkey = new PublicKey(nft);
      const data = await getMetadata(connection, nftPubkey);
      setMetadata(data);

      const GetTxHistoryByNFTAddr = query(
        ref(database),
        orderByChild("nftAddress"),
        equalTo(nft)
      );

      await get(GetTxHistoryByNFTAddr)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const TxHistoryData: TxHistory[] = snapshot.val();
            var sortedTxHistoryData = [];
            console.log(TxHistoryData);

            for (var id in TxHistoryData) {
              sortedTxHistoryData.push(TxHistoryData[id]);
            }
            sortedTxHistoryData.sort((a: TxHistory, b: TxHistory): number => {
              // Convert string dates into `Date` objects
              const date1: Date = new Date(a["updatedAt"] || a["createdAt"]);
              const date2: Date = new Date(b["updatedAt"] || b["createdAt"]);

              return date2.valueOf() - date1.valueOf(); // DECREASING ORDER
            });
            const items = (sortedTxHistoryData || []) as TxHistory[];
            if (
              items.length !== 0 &&
              items.find((item) => item.sellerAddress === sellerAddress)
            ) {
              setTransaction(
                items.find((item) => item.sellerAddress === sellerAddress)
              );
            }
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    const link = "https://www.google.com";
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(link);
    } else {
      document.execCommand("copy", true, link);
    }
  };

  const handlePostSubmit = (transaction: TxHistory | undefined) => {
    setTransaction(transaction);
  };

  const formatRpc = "";
  return (
    <Layout formatRpc={formatRpc}>
      <section className="relative pt-12 bg-blueGray-50 px-4">
        <button
          className="text-gray-700"
          onClick={() => router.back()}
        >{`< Trở lại`}</button>
        {transaction && transaction.status === TransactionStatus.REQUESTED && (
          <div className="w-full rounded-md bg-pink-200 p-4 ml-auto mr-auto">
            <div className="grid grid-cols-10">
              <div className="sm:col-span-8 col-span-10">
                <h3 className="text-lg font-medium text-gray-700">
                  Yêu cầu đã thực hiện
                </h3>
                <p className="text-md text-gray-700 pt-2">{`Send this site's web link to Seller so that they can accept your offer!`}</p>
              </div>
              <div className="col-span-2 self-center">
                <button
                  onClick={handleCopy}
                  className="shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 py-2 px-4"
                >
                  Sao chép Link
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="items-center flex flex-wrap">
          <div className="md:w-5/12 ml-auto mr-auto bg-gray-50 sm:px-4">
            <div className="flex flex-col">
              <div className="flex-shrink  place-self-center pt-4">
                <MetaImage uri={metadata?.data.uri!} type={ImageType.Detail} />
              </div>
              <div className="flex-none p-4 text-center">
                {metadata?.data.name}
              </div>
              <div className="flex-none pb-4 text-gray-600 text-center">
                {metadata?.data.symbol}
              </div>
            </div>
          </div>
          <div className="w-full md:w-7/12 ml-auto mr-auto px-4">
            {sellerAddress === publicKey?.toBase58() ? (
              <SellerInput
                isRequested={
                  transaction?.status === TransactionStatus.REQUESTED
                }
                nftAddress={nft as string}
                onSubmitted={handlePostSubmit}
              />
            ) : (
              <ItemInfo
                isRequested={
                  transaction?.status === TransactionStatus.REQUESTED
                }
                nftAddress={nft as string}
                sellerAddress={sellerAddress as string}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
