import { Badge, Dropdown, Menu, Divider } from "antd";
import React, { BaseSyntheticEvent, ReactElement } from "react";
import {
  DownOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  LogoutOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import styles from "./index.module.css";
import { useGlobalState } from "../../context";
import { useRouter } from "next/router";
import { Cluster } from "@solana/web3.js";
import { Wallet, utils } from "ethers";
import { InfuraProvider } from "@ethersproject/providers";
import { refreshBalance } from "../../utils";

type DomEvent = {
  domEvent: BaseSyntheticEvent;
  key: string;
  keyPath: Array<string>;
};

const Layout = ({ children }: { children: JSX.Element }): ReactElement => {
  const { network, setNetwork,mnemonic, account, setAccount, setBalance, setMnemonic } =
    useGlobalState();

  const router = useRouter();

  const selectNetwork = async (e: DomEvent) => {
    const networks: Array<string> = ["homestead", "rinkeby"];
    const selectedNetwork = networks[parseInt(e.key) - 1];
    setNetwork(selectedNetwork);

    var inputMnemonic = mnemonic == null ? "":mnemonic;
    const wallet = Wallet.fromMnemonic(inputMnemonic, `m/44'/60'/0'/0/0`);
    const preAccount = account == null? wallet: account;
    var provider = new InfuraProvider(selectedNetwork, "7ee79ae6d89a4df88ba9f65942c4b4ca");
    const newAccount =  preAccount.connect(provider);
    // // This line sets the account to context state so it can be used by the app
    setAccount(newAccount);
    
    await refreshBalance(selectedNetwork,newAccount);
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={selectNetwork} key="1">
        Mainnet {network === "homestead" && <Badge status="processing" />}
      </Menu.Item>
      <Menu.Item onClick={selectNetwork} key="2">
        Rinkeby {network === "rinkeby" && <Badge status="processing" />}
      </Menu.Item>
    </Menu>
  );

  const handleLogout = () => {
    setAccount(null);
    setNetwork("homestead");
    setBalance(0);
    setMnemonic("");
    router.push("/");
  };

  const profile = (
    <Menu>
      <Menu.Item key="/wallet" icon={<CreditCardOutlined />}>
        <Link href="/wallet" passHref>
          Wallet
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <header className={styles.header}>
          <Link href={`/`} passHref>
            <div className={`${styles.top} ${styles.logo}`}>MyWallet</div>
          </Link>

          <Menu
            mode="horizontal"
            className={styles.nav}
            selectedKeys={[router.pathname]}
          >
            <Dropdown className={styles.top} overlay={menu} disabled={!account}>
              <a
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                Network <DownOutlined />
              </a>
            </Dropdown>

            {account && (
              <Dropdown
                className={styles.top}
                overlay={profile}
                disabled={!account}
              >
                <a
                  className="ant-dropdown-link"
                  onClick={(e) => e.preventDefault()}
                >
                  <UserOutlined />
                </a>
              </Dropdown>
            )}
          </Menu>
        </header>

        {children}

        {router.pathname !== "/" && (
          <Link href="/" passHref>
            <a className={styles.back}>
              <ArrowLeftOutlined /> Back Home
            </a>
          </Link>
        )}

        <Divider style={{ marginTop: "3rem" }} />

        <footer className={styles.footerHome}>
          <p>
            MyWallet tutorial created by{" "}
            <a className={styles.footerLink} href="https://learn.figment.io/">
              Figment Learn
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;