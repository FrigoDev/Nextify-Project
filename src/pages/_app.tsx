import "@/styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import Loading from "@/components/Loading";
import MainLayout from "@/components/MainLayout";
import { store, persistor } from "@/store/store";

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Loading>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </Loading>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
};

export default App;
