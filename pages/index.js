import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [pin, setPin] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (acc) => {
    if (acc) {
      console.log("Account connected: ", acc);
      setAccount(acc);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({
        method: "eth_requestAccounts",
      });
      handleAccount(accounts[0]);
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error.message);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(
      contractAddress,
      atmABI,
      signer
    );

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error.message);
      }
    }
  };

  const deposit = async (amount) => {
    if (atm && validatePin()) {
      try {
        // Check if the deposit amount is at least 100
        if (amount < 100) {
          setErrorMessage("Minimum deposit amount is 100 ETH.");
          setSuccessMessage("");
          return;
        }

        const tx = await atm.deposit(amount);
        await tx.wait();
        getBalance();
        setSuccessMessage(`Successfully deposited ${amount} ETH.`);
        setErrorMessage("");
      } catch (error) {
        console.error("Error depositing funds:", error.message);
        setErrorMessage("Failed to deposit funds.");
        setSuccessMessage("");
      }
    }
  };

  const withdraw = async (amount) => {
    if (atm && validatePin()) {
      try {
        // Check if the withdrawal amount is at least 50
        if (amount < 50) {
          setErrorMessage("Minimum withdrawal amount is 50 ETH.");
          setSuccessMessage("");
          return;
        }

        const tx = await atm.withdraw(amount);
        await tx.wait();
        getBalance();
        setSuccessMessage(`Successfully withdrew ${amount} ETH.`);
        setErrorMessage("");
      } catch (error) {
        console.error("Error withdrawing funds:", error.message);
        setErrorMessage("Failed to withdraw funds.");
        setSuccessMessage("");
      }
    }
  };

  const validatePin = () => {
    if (pin === "1001") {
      setErrorMessage("");
      return true;
    } else {
      setErrorMessage("Incorrect PIN. Please try again.");
      setSuccessMessage("");
      return false;
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect Metamask Wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    const depositMessage = "Minimum deposit is 100 ETH.";
    const withdrawMessage = "Minimum withdrawal is 50 ETH.";

    return (
      <div>
        <p style={{ color: "white" }}>Account Address: {account}</p>
        <p style={{ color: "white" }}>Account Balance: {balance}</p>
        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <div>
          <input
            type="number"
            placeholder="Enter deposit amount"
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={() => deposit(depositAmount)}>
            Deposit
          </button>
          <p style={{ color: "white", marginLeft: "10px" }}>
            {depositMessage}
          </p>
        </div>
        <div>
          <input
            type="number"
            placeholder="Enter withdrawal amount"
            onChange={(e) => setWithdrawalAmount(e.target.value)}
          />
          <button onClick={() => withdraw(withdrawalAmount)}>
            Withdraw
          </button>
          <p style={{ color: "white", marginLeft: "10px" }}>
            {withdrawMessage}
          </p>
        </div>
        <p style={{ color: "red" }}>{errorMessage}</p>
        <p style={{ color: "green" }}>{successMessage}</p>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container" style={{ backgroundColor: "brown" }}>
      <header>
        <h1 style={{ color: "white" }}>
          Welcome to the Metacrafters ATM!
        </h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
