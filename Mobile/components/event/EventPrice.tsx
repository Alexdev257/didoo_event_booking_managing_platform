import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useGetTicketTypes } from '@/hooks/useTicket';

interface EventPriceProps {
  eventId: string;
  style?: StyleProp<TextStyle>;
  prefix?: string;
}

export const EventPrice: React.FC<EventPriceProps> = ({ eventId, style, prefix = '' }) => {
  const { data: ticketTypesRes } = useGetTicketTypes({ eventId }, { enabled: !!eventId });
  const ticketTypes = ticketTypesRes?.data?.items || [];

  const minPrice = React.useMemo(() => {
    const prices = ticketTypes.map(t => t.price).filter(p => p != null && p >= 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [ticketTypes]);

  if (minPrice === null) {
    return <Text style={[styles.text, style]}>Liên hệ</Text>;
  }

  if (minPrice === 0) {
    return <Text style={[styles.text, style]}>Miễn phí</Text>;
  }

  return (
    <Text style={[styles.text, style]}>
      {prefix}{minPrice.toLocaleString('vi-VN')}đ
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1f36',
  },
});
