import React, { useEffect, useRef } from 'react';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import {
  hideWidget,
  initTawkTo,
  tawkToLoadScripts,
  onChangeWidget,
  changeStyles,
} from './tawkto';
import { User } from '../__generated__/graphql';

export const ChatWidget: React.FC<{
  showChat: boolean;
  user: User | null;
}> = ({ showChat, user }) => {
  //console.log('showChat', showChat);
  //const { user } = useContext(AuthContext);
  //const [display, setDisplay] = useState('flex');

  const tawkMessengerRef = useRef(TawkMessengerReact);

  // const onChatEnded = () => {
  //   console.log('endChat');
  //   tawkMessengerRef.current.endChat();
  //   // place your code here
  // };

  const onLoad = async () => {
    // console.log('onLoad');
    // console.log(user);
    // place your code here
    tawkMessengerRef.current.setAttributes(
      {
        name: user?.firstName,
        email: user?.email,
      },
      function (error: any) {
        // do something if error
      },
    );
  };
  const onChatEnded = () => {
    console.log('endChat');
    // if (tawkMessengerRef.current) {
    //   tawkMessengerRef.current.onLoad = function () {
    //     tawkMessengerRef.current.hideWidget();
    //   };
    // }
    // place your code here
  };
  const isChatHidden = () => {
    console.log('isChatHidden');
  };
  // useEffect(() => {
  //   if (user !== null) {
  //     initTawkTo();
  //   }
  //   return () => {
  //     console.log('clean up');
  //   };
  // }, [user]);

  // useEffect(() => {
  //   if (showChat) {
  //     console.log('showChat');
  //   } else {
  //     console.log('hideChat');
  //     hideChat();
  //     if (tawkMessengerRef.current) tawkMessengerRef.current.onLoad();

  //     tawkMessengerRef.current?.hideWidget();
  //   }
  // }, [showChat]);

  // useEffect(() => {
  //   if (!showChat) {
  //     tawkMessengerRef.current = tawkMessengerRef.current.minimize();
  //   }
  // }, [showChat]);

  // useEffect(() => {
  //   if (user) {
  //     console.log('set user');
  //     tawkMessengerRef.current = tawkMessengerRef.current.onLoad = function () {
  //       tawkMessengerRef.current
  //         .setAttributes(
  //           {
  //             name: user.firstName,
  //             email: user.email,
  //             hash: 'hash value 123434',
  //           },
  //           function (error: any) {
  //             console.log('error', error);
  //           },
  //         )
  //         .then((response: any) => console.log('response', response));
  //     };
  //   }
  // }, [user]);

  useEffect(() => {
    if (!showChat) {
      tawkMessengerRef.current = tawkMessengerRef.current.minimize();
    }
    // return () => {
    //   tawkMessengerRef.current = tawkMessengerRef.current.onLoad = function () {
    //     tawkMessengerRef.current.toggleVisibility();
    //   };
    // };
  }, [showChat]);

  return (
    <TawkMessengerReact
      propertyId={process.env.REACT_APP_TAWK_API_KEY as string}
      widgetId={process.env.REACT_APP_TAWK_WIDGET_ID as string}
      ref={tawkMessengerRef}
      onLoad={onLoad}
      onChatEnded={onChatEnded}
      isChatHidden={isChatHidden}
    />
  );
};
