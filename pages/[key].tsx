import env from '@/lib/env';
import languages from '@/lib/languages';
import { useRouter } from 'next/router';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {
  default as AnsiUp
} from 'ansi_up';
interface DocumentPageProps {
  contents0: string;
  contents1: string;
  finalKey: string;
  originalKey: string;
  languageId: string;
}

const DocumentPage = ({ contents0, contents1, finalKey, originalKey, languageId }: DocumentPageProps) => {
  const router = useRouter();

  return (
    <Tabs>
      <TabList>
        <Tab>Logs</Tab>
        <Tab>Dmesg</Tab>
      </TabList>

      <TabPanel>
        <pre className="code">
          {contents0}
        </pre>
      </TabPanel>
      <TabPanel>
        <pre className="code">
          {contents1}
        </pre>
      </TabPanel>
    </Tabs>
  );
};

export default DocumentPage;

export async function getServerSideProps({ req, res, params }) {
  let key = params.key;
  let originalKey = key;

  let languageId = 'plain';

  const components = key.split('.');
  if (components.length > 1) {
    const extension = components.pop();
    key = components.join('.');

    const targetLanguage = Object.values(languages)
      .find(l => l.extension === extension);

    if (targetLanguage) {
      languageId = targetLanguage.id;
    }
  }


  const ansi_up = new AnsiUp();

  const baseUrl = env('site-url', true);

  const data = await fetch(`${baseUrl}/api/documents/${key + "0"}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  });

  const json = await data.json();

  if (!json.ok) {
    return {
      notFound: true
    };
  }

  const contents0 = json.contents;

  const data1 = await fetch(`${baseUrl}/api/documents/${key + "1"}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  });

  const json1 = await data1.json();

  if (!json1.ok) {
    return {
      notFound: true
    };
  }

  const contents1 = json1.contents;

  const items0 = [];

  for (const value0 of contents0.split("\n")) {
    items0.push(<code>{ansi_up.ansi_to_html(value0)}</code>);
  }

  const items1 = [];

  for (const value1 of contents1.split("\n")) {
    items1.push(<code>{ansi_up.ansi_to_html(value1)}</code>);
  }

  return {
    props: {
      items0,
      items1,
      finalKey: key,
      originalKey,
      languageId
    }
  };
};
