// import { useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import branch from 'react-native-branch';

// const STORAGE_KEY = 'referral_code';

// export function useCaptureReferralCode() {
//   useEffect(() => {
//     // Subscribe to Branch deep link data
//     const unsubscribe = branch.subscribe(({ error, params }) => {
//       if (error) {
//         console.error('Branch subscribe error:', error);
//         return;
//       }

//       console.log('Branch params:', params);

//       // Check if we have a referral code in the Branch params
//       // Branch will automatically handle deferred deep links (post-install attribution)
//       if (params?.code && !params['+clicked_branch_link']) {
//         // This is an organic install, not from a Branch link
//         return;
//       }

//       if (params?.code && typeof params.code === 'string') {
//         AsyncStorage.setItem(STORAGE_KEY, params.code)
//           .then(() => console.log('Referral saved from Branch:', params.code))
//           .catch(console.error);
//       }

//       // You can also access other Branch attribution data:
//       // - params['~referring_link'] - the link that was clicked
//       // - params['~channel'] - channel like Facebook, Twitter, etc
//       // - params['~campaign'] - campaign name if set
//       // - params['+is_first_session'] - true if this is first app open
//     });

//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, []);

//   return null;
// }

// export async function getStoredReferral(): Promise<string | null> {
//   return AsyncStorage.getItem(STORAGE_KEY);
// }

// export async function clearStoredReferral(): Promise<void> {
//   return AsyncStorage.removeItem(STORAGE_KEY);
// }
