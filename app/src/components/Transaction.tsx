import { TxHistory, TransactionStatus } from "../types";
import { ModalUserAction, useModalDispatch } from "../contexts/ModalContext";
import { TransactionType } from "../types";

interface TransactionProps {
  txHistory: TxHistory;
  type: TransactionType;
}

const shortAddress = (address: string) => {
  return address.slice(0, 3) + ".." + address.slice(-4);
};

const StatusLogo = ({ status }: { status: TransactionStatus }) => {
  switch (status) {
    case TransactionStatus.ACCEPTED:
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Đã chấp nhận
          </span>
        </td>
      );
    case TransactionStatus.CANCELED:
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
            Đã huỷ
          </span>
        </td>
      );
    case TransactionStatus.REQUESTED:
      return (
        <td className="px-3 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Đã yêu cầu
          </span>
        </td>
      );
  }
};

interface ActionButtonProps {
  onClick: () => any;
  status: TransactionStatus;
  type: TransactionType;
}
const ActionButton = ({ onClick, type, status }: ActionButtonProps) => {
  if (
    type === TransactionType.Seller &&
    status === TransactionStatus.REQUESTED
  ) {
    return (
      <button
        className="text-indigo-600 hover:text-indigo-900"
        onClick={onClick}
      >
        Discard
      </button>
    );
  }
  if (
    type === TransactionType.Buyer &&
    status === TransactionStatus.REQUESTED
  ) {
    return (
      <button
        className="text-indigo-600 hover:text-indigo-900"
        onClick={onClick}
      >
        Accept
      </button>
    );
  }
  return (
    <div className="w-16 whitespace-nowrap text-center text-sm text-gray-500">
      -
    </div>
  );
};

const AddressLink = ({ address }: { address: string }) => {
  return (
    <a
      href={`https://explorer.solana.com/address/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {shortAddress(address)}
    </a>
  );
};

export const Transaction = ({ txHistory, type }: TransactionProps) => {
  const dispatch = useModalDispatch();
  const date = new Date(txHistory.createdAt);

  const handleClick = () => {
    switch (type) {
      case TransactionType.Seller:
        dispatch({
          type: "SHOW_DIALOG",
          input: {
            buttonName: "Huỷ đề nghị",
            message: `Điều này sẽ huỷ yêu cầu giao dịch NFT:\n${txHistory.nftAddress}`,
            title: "Discard Offer",
            props: {
              type: ModalUserAction.CancelOffer,
              id: txHistory.id,
              escrowAddress: txHistory.escrowAddress,
              sellerAddress: txHistory.sellerAddress,
              buyerAddress: txHistory.buyerAddress,
              nftAddress: txHistory.nftAddress,
            },
          },
        });
        break;
      case TransactionType.Buyer:
        dispatch({
          type: "SHOW_DIALOG",
          input: {
            buttonName: "Accept Offer",
            message: `Bạn có muốn chấp nhận đề nghị giao dịch NFT này:\n${txHistory.nftAddress}`,
            title: "Chấp nhận đề nghị",
            props: {
              type: ModalUserAction.AcceptOffer,
              id: txHistory.id,
              escrowAddress: txHistory.escrowAddress,
              amount: txHistory.offeredAmount,
              sellerAddress: txHistory.sellerAddress,
              buyerAddress: txHistory.buyerAddress,
              nftAddress: txHistory.nftAddress,
            },
          },
        });
        break;
    }
  };
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:text-gray-900">
        <AddressLink address={txHistory.buyerAddress} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <AddressLink address={txHistory.sellerAddress} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <AddressLink address={txHistory.nftAddress} />
      </td>
      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
        {txHistory.offeredAmount}
      </td>
      <StatusLogo status={txHistory.status} />
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
        {date.toLocaleString()}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButton
          type={type}
          status={txHistory.status}
          onClick={handleClick}
        />
      </td>
    </tr>
  );
};
