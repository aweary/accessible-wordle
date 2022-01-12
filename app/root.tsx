import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "remix";
import type { MetaFunction, LinksFunction } from "remix";
import styles from './styles.css'

export const meta: MetaFunction = () => {
  return { title: "Accessible Wordle" };
};

export const links : LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@radix-ui/colors@latest/blue.css'},
    { rel: 'stylesheet', href: styles }
  ]
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
