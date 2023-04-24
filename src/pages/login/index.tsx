import Image from "next/image";
import { InferGetServerSidePropsType } from "next/types";
import { ClientSafeProvider, getProviders, signIn } from "next-auth/react";

type LoginProps = {
  providers: InferGetServerSidePropsType<typeof getServerSideProps>;
};

const Login = ({ providers }: LoginProps) => {
  return (
    <div className="flex flex-col items-center justify-center bg-black min-h-screen w-full">
      <div className="ripple-effect">
        <Image
          priority
          width={200}
          height={200}
          src="/assets/spotifyLogo.png"
          alt="Spotify logo"
        />
      </div>
      {providers &&
        (Object.values(providers) as unknown as ClientSafeProvider[]).map(
          (provider) => (
            <div className="absolute top-2/3" key={provider.name}>
              <button
                className="bg-[#1dd661] text-white px-5 py-3 rounded-full font-semibold hover:bg-[#0f6f32] duration-700 ease-in-out"
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              >
                {`Login with
                ${provider.name}`}
              </button>
            </div>
          )
        )}
    </div>
  );
};

export default Login;

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
