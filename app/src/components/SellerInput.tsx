import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";
import { useRef, useState } from "react";
import { feePercentage } from "../constants";
import {
  useLoadingDispatch,
  useLoadingState,
} from "../contexts/LoadingContext";
import { TransactionStatus, CreateTxHistoryInput, TxHistory } from "../types";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { v4 as uuidv4 } from "uuid";
import { database } from "../firebase";
import { ref, push, update } from "firebase/database";
import { requestOffer } from "../web3/requestOffer";
import { useProgram } from "../web3/useProgram";

interface SellerInputProps {
  nftAddress: string;
  isRequested: boolean;
  onSubmitted: (transaction: TxHistory | undefined) => void;
}
export const SellerInput = ({
  nftAddress,
  isRequested,
  onSubmitted,
}: SellerInputProps) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const loadingDispatch = useLoadingDispatch();
  const loadingState = useLoadingState();
  const [amount, setAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);
  const buyerAddressInputRef = useRef<HTMLInputElement>(null);
  const [buyerAddress, setBuyerAddress] = useState<string>("");
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setAmount(value);
    const v = new BigNumber(value);

    const fee = v.multipliedBy(feePercentage);
    setFee(fee.toNumber());
  };

  const handleChangeBuyerAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(e.target.value);
    setBuyerAddress(value);
  };

  const isDisabled = () => {
    return (
      isRequested ||
      amount <= 0 ||
      buyerAddress.length === 0 ||
      loadingState.show ||
      !publicKey
    );
  };

  const resetInputs = () => {
    setBuyerAddress("");
    setAmount(0);
    setFee(0);
    setErrorMessage("");
    if (amountInputRef.current) {
      amountInputRef.current.value = "";
    }
    if (buyerAddressInputRef.current) {
      buyerAddressInputRef.current.value = "";
    }
  };

  const isValidAmount = (amt: number) => {
    const decimal = new BigNumber(amt).mod(1).toString();
    return decimal.length < 4;
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setErrorMessage("");

    if (!publicKey || !signTransaction) {
      setErrorMessage(
        "Wallet is not connected properly. Re-connect your wallet."
      );
      return;
    }
    if (!isValidAmount(amount)) {
      setErrorMessage("Offer amount accepts one decimal. Try rounding up.");
      return;
    }
    try {
      const TxHistory = await requestOffer({
        connection,
        seller: publicKey,
        buyerAddressStr: buyerAddress,
        sellerNFTAddressStr: nftAddress,
        wallet: wallet,
        program: program,
        amountInSol: amount,
        fee,
        signTransaction,
      });
      loadingDispatch({ type: "SHOW_LOADING" });
      console.log(TxHistory);

      // TODO: update this with real data
      console.log("Create escrowToken");
      const escrowAccount = Keypair.generate();

      // Get a key for a new TxHistory.
      const newTxHistoryKey = push(ref(database)).key || uuidv4();

      const newTxHistory: CreateTxHistoryInput = {
        ...TxHistory,
        id: newTxHistoryKey,
        createdAt: new Date(Date.now()).toISOString(),
      };

      // Write the new TxHistory data in the TxHistory list
      const updates: { [key: string]: any } = {};
      updates[newTxHistoryKey] = newTxHistory;

      await update(ref(database), updates);

      resetInputs();
      onSubmitted((newTxHistory as TxHistory) || undefined);
    } catch (e) {
      console.error(e);
      setErrorMessage((e as Error).message);
    } finally {
      loadingDispatch({ type: "HIDE_LOADING" });
    }
  };

  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:gap-6">
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="p-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Các yêu cầu giao dịch
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Điền thông tin vào để tạo một đề nghị giao dịch.
            </p>
          </div>
          <form action="#" method="POST">
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-x-6 gap-y-4">
                  <div className="col-span-6 sm:col-span-5">
                    <label
                      htmlFor="token-address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Địa chỉ NFT
                    </label>
                    <input
                      type="text"
                      name="token-address"
                      id="token-address"
                      readOnly
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm  sm:text-sm border-gray-300 rounded-md"
                      value={nftAddress}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-5">
                    <label
                      htmlFor="buyer-address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Địa chỉ người mua
                    </label>
                    <input
                      ref={buyerAddressInputRef}
                      id="buyer-address"
                      maxLength={44}
                      name="buyer-address"
                      type="text"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      onChange={handleChangeBuyerAddress}
                    />
                  </div>

                  <div className="col-span-3">
                    <label
                      htmlFor="offered-amount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Giá thành đề nghị (Sol)
                    </label>
                    <input
                      ref={amountInputRef}
                      id="offered-amount"
                      maxLength={3}
                      name="offered-amount"
                      type="number"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      onChange={handleChangeAmount}
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <div className="text-md font-medium text-gray-900">
                  {`Tổng: ${new BigNumber(amount).plus(fee)} SOL(phí:${fee})`}
                </div>
                <div className="text-xs font-medium text-gray-700 py-1">
                  {fee * 100}% phí giao dịch được đính kèm. Sẽ thu phí khi người
                  mua chấp nhận giao dịch
                </div>
                {errorMessage.length > 0 && (
                  <div className="text-sm font-medium text-red-700 py-2">
                    {errorMessage}
                  </div>
                )}
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={isDisabled()}
                  onClick={handleSubmit}
                >
                  Tạo đề nghị
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
