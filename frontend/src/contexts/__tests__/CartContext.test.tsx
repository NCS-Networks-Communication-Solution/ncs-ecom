import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../CartContext';
import { cartService } from '@/services/cartService';

type CartResponse = Awaited<ReturnType<typeof cartService.getCart>>;

describe('CartContext totals', () => {
  const emptyCart: CartResponse = {
    id: 'user-id',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  };

  const populatedCart: CartResponse = {
    id: 'user-id',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 15000,
        total: 45000,
        product: {
          id: 'prod-1',
          sku: 'SW-24P-1G',
          nameEn: 'Managed Switch',
          nameTh: 'สวิตช์จัดการได้',
          price: 15000,
          description: 'Enterprise switch',
          descriptionEn: 'Enterprise switch',
          descriptionTh: 'สวิตช์สำหรับองค์กร',
          specifications: { ports: 24 },
          images: [],
          categoryId: 'cat-switch',
          category: {
            id: 'cat-switch',
            nameEn: 'Switches',
            nameTh: 'สวิตช์',
          },
        },
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 32000,
        total: 64000,
        product: {
          id: 'prod-2',
          sku: 'RT-ENT-5G',
          nameEn: 'Enterprise Router',
          nameTh: 'เราเตอร์องค์กร',
          price: 32000,
          description: 'High availability router',
          descriptionEn: 'High availability router',
          descriptionTh: 'เราเตอร์สำหรับองค์กร',
          specifications: { fiveG: true },
          images: [],
          categoryId: 'cat-router',
          category: {
            id: 'cat-router',
            nameEn: 'Routers',
            nameTh: 'เราเตอร์',
          },
        },
      },
    ],
    subtotal: 109000,
    tax: 7630,
    total: 116630,
    itemCount: 2,
  };

  beforeEach(() => {
    jest.spyOn(cartService, 'getCart').mockResolvedValue(emptyCart);
    jest.spyOn(cartService, 'addToCart').mockResolvedValue(populatedCart);
    jest.spyOn(cartService, 'updateItem').mockResolvedValue(populatedCart);
    jest.spyOn(cartService, 'removeItem').mockResolvedValue(emptyCart);
    jest.spyOn(cartService, 'clear').mockResolvedValue(emptyCart);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function Harness() {
    const { totals, items, addToCart, setAccessToken } = useCart();

    useEffect(() => {
      setAccessToken('demo-token');
    }, [setAccessToken]);

    return (
      <div>
        <div data-testid="item-count">{totals.itemCount}</div>
        <div data-testid="total-quantity">{totals.totalQuantity}</div>
        <div data-testid="vat">{totals.tax}</div>
        <div data-testid="grand-total">{totals.total}</div>
        <div data-testid="line-items">{items.length}</div>
        <button type="button" onClick={() => addToCart('prod-1', 2)}>
          Populate cart
        </button>
      </div>
    );
  }

  it('computes totals from cart payloads returned by the service', async () => {
    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /populate cart/i }));

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total-quantity')).toHaveTextContent('5');
    });

    expect(screen.getByTestId('vat')).toHaveTextContent('7630');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('116630');
    expect(screen.getByTestId('line-items')).toHaveTextContent('2');
    expect(cartService.addToCart).toHaveBeenCalledWith('demo-token', 'prod-1', 2);
  });
});
