import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { phoneApi } from '../api/phoneApi';

export const fetchPhones = createAsyncThunk(
  'phones/fetchPhones',
  async () => await phoneApi.fetchPhones()
);

export const addNewPhone = createAsyncThunk(
  'phones/addNewPhone',
  async (phoneData, { rejectWithValue }) => {
    try {
      return await phoneApi.addPhone(phoneData);
    } catch (error) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

export const deletePhone = createAsyncThunk(
  'phones/deletePhone',
  async (id) => {
    await phoneApi.deletePhone(id);
    return id;
  }
);

const phoneSlice = createSlice({
  name: 'phones',
  initialState: {
    items: [],
    selectedCountry: '+7',
    status: 'idle',
    error: null,
    wsConnected: false
  },
  reducers: {
    setCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
    wsAddPhone: (state, action) => {
      // Преобразуем ID к числу для консистентности
      const phone = {
        ...action.payload,
        id: Number(action.payload.id)
      };
      
      // Проверяем, не существует ли уже такой номер (по ID и номеру)
      const exists = state.items.some(item => 
        item.id === phone.id || 
        (item.country_code === phone.country_code && 
         item.number === phone.number)
      );
      
      if (!exists) {
        state.items.unshift(phone);
      }
    },
    wsDeletePhone: (state, action) => {
      state.items = state.items.filter(item => item.id !== Number(action.payload));
    },
    setWsStatus: (state, action) => {
      state.wsConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhones.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPhones.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.map(phone => ({
          ...phone,
          id: Number(phone.id) // Преобразуем ID к числу
        }));
      })
      .addCase(fetchPhones.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(addNewPhone.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addNewPhone.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(addNewPhone.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(deletePhone.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deletePhone.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== Number(action.payload));
      })
      .addCase(deletePhone.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { 
  setCountry, 
  wsAddPhone, 
  wsDeletePhone,
  setWsStatus
} = phoneSlice.actions;

export default phoneSlice.reducer;