# State Management Recommendations

This document provides recommendations for state management approaches in the Conceptus Veritas application, focusing on different UI complexity levels and feature requirements.

## State Management Approaches

The application should use a combination of state management approaches based on the complexity and scope of each feature:

| Approach                  | Complexity | Scope     | When to Use                                   |
| ------------------------- | ---------- | --------- | --------------------------------------------- |
| **Local Component State** | Low        | Component | Simple UI state, form inputs                  |
| **React Context**         | Medium     | Feature   | Shared state within a feature                 |
| **Redux**                 | High       | Global    | Complex global state, many interactions       |
| **BLoC Pattern**          | High       | Feature   | Complex business logic with state transitions |

## Recommended Approach by Feature Type

### 1. Simple UI Components

**Recommendation: Local Component State**

For simple UI components with minimal state requirements:

```tsx
function SimpleCounter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**When to use:**

- Form inputs
- Toggle states (open/closed)
- Simple counters
- UI-only state that doesn't affect other components

### 2. Feature-Specific State

**Recommendation: React Context + Custom Hooks**

For state that needs to be shared across multiple components within a feature:

```tsx
// 1. Create a context
const FeatureContext = createContext<FeatureContextValue | undefined>(undefined);

// 2. Create a provider component
export const FeatureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FeatureState>(initialState);

  const contextValue = {
    state,
    someAction: () => {
      // Update state
      setState({ ...state, someProperty: newValue });
    },
  };

  return <FeatureContext.Provider value={contextValue}>{children}</FeatureContext.Provider>;
};

// 3. Create a custom hook
export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};
```

**When to use:**

- User preferences within a feature
- Feature-specific settings
- Shared state between related components
- Moderate complexity state that doesn't need global access

### 3. Complex Global State

**Recommendation: Redux Toolkit**

For complex global state that needs to be accessed across multiple features:

```tsx
// 1. Create a slice
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    someAction(state, action) {
      // Update state
      state.someProperty = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(someAsyncThunk.fulfilled, (state, action) => {
      // Handle async action completion
      state.data = action.payload;
      state.loading = false;
    });
  }
});

// 2. Create async thunks for side effects
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.fetchData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Use in components
function ComplexFeature() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.feature);

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  return (
    // Component UI
  );
}
```

**When to use:**

- User authentication state
- Shopping cart
- Global notifications
- Complex state shared across multiple features
- State that needs to persist across page refreshes (with Redux Persist)

### 4. Complex Business Logic with State Transitions

**Recommendation: BLoC Pattern**

For features with complex business logic and multiple state transitions:

```tsx
// 1. Define events and states
type FeatureEvent =
  | { type: 'LOAD_DATA' }
  | { type: 'DATA_LOADED', payload: Data }
  | { type: 'ERROR', payload: string };

type FeatureState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded', data: Data }
  | { status: 'error', error: string };

// 2. Create a BLoC
class FeatureBloc {
  private state: FeatureState = { status: 'idle' };
  private listeners: ((state: FeatureState) => void)[] = [];

  getState(): FeatureState {
    return this.state;
  }

  subscribe(listener: (state: FeatureState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setState(newState: FeatureState): void {
    this.state = newState;
    this.listeners.forEach(listener => listener(this.state));
  }

  dispatch(event: FeatureEvent): void {
    switch (event.type) {
      case 'LOAD_DATA':
        this.setState({ status: 'loading' });
        this.fetchData();
        break;
      case 'DATA_LOADED':
        this.setState({ status: 'loaded', data: event.payload });
        break;
      case 'ERROR':
        this.setState({ status: 'error', error: event.payload });
        break;
    }
  }

  private async fetchData(): Promise<void> {
    try {
      const data = await api.fetchData();
      this.dispatch({ type: 'DATA_LOADED', payload: data });
    } catch (error) {
      this.dispatch({ type: 'ERROR', payload: error.message });
    }
  }
}

// 3. Create a React hook to use the BLoC
function useFeatureBloc(): [FeatureState, (event: FeatureEvent) => void] {
  const blocRef = useRef<FeatureBloc>(new FeatureBloc());
  const [state, setState] = useState<FeatureState>(blocRef.current.getState());

  useEffect(() => {
    const unsubscribe = blocRef.current.subscribe(setState);
    return unsubscribe;
  }, []);

  const dispatch = useCallback((event: FeatureEvent) => {
    blocRef.current.dispatch(event);
  }, []);

  return [state, dispatch];
}

// 4. Use in components
function ComplexFeature() {
  const [state, dispatch] = useFeatureBloc();

  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, [dispatch]);

  return (
    // Render based on state
  );
}
```

**When to use:**

- Multi-step forms
- Complex filtering and sorting
- Real-time data updates
- Features with complex state machines
- Features requiring fine-grained control over side effects

## Specific Recommendations for Key Features

### Authentication

**Recommendation: React Context + Custom Hook**

Authentication state should be managed using React Context for global access with a focused API:

```tsx
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authService
      .getCurrentUser()
      .then(user => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: Credentials): Promise<User> => {
    setLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
};
```

### Subscription Management

**Recommendation: Redux Toolkit**

Subscription state should be managed using Redux for global access and persistence:

```tsx
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    currentTier: null,
    features: {},
    loading: false,
    error: null,
  },
  reducers: {
    // Reducers here
  },
  extraReducers: builder => {
    // Handle async actions
  },
});

// Async thunks
export const fetchUserSubscription = createAsyncThunk(
  'subscription/fetchUserSubscription',
  async (userId: string, { rejectWithValue }) => {
    try {
      const subscription = await subscriptionService.getUserSubscription(userId);
      return subscription;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Feature Gating

**Recommendation: React Context + Redux**

Feature gating should use a combination of Redux for the subscription data and a React Context for the feature access API:

```tsx
export const FeatureGateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const subscription = useSelector(state => state.subscription);

  const canUseFeature = useCallback(
    (featureId: string): boolean => {
      if (!subscription.currentTier) return false;

      const feature = subscription.features[featureId];
      return feature?.isEnabled || false;
    },
    [subscription]
  );

  const getFeatureLimit = useCallback(
    (featureId: string): number | 'unlimited' => {
      if (!subscription.currentTier) return 0;

      const feature = subscription.features[featureId];
      return feature?.usageLimit ?? 'unlimited';
    },
    [subscription]
  );

  return (
    <FeatureGateContext.Provider value={{ canUseFeature, getFeatureLimit }}>
      {children}
    </FeatureGateContext.Provider>
  );
};
```

### AI Router and Premium Features

**Recommendation: BLoC Pattern**

AI Router should use the BLoC pattern for complex state transitions and side effects:

```tsx
type AIRouterEvent =
  | { type: 'SUBMIT_QUERY'; payload: string }
  | { type: 'SELECT_MODEL'; payload: string }
  | { type: 'RESPONSE_RECEIVED'; payload: AIResponse }
  | { type: 'ERROR'; payload: string };

type AIRouterState =
  | { status: 'idle' }
  | { status: 'selecting_model'; query: string }
  | { status: 'processing'; query: string; model: string }
  | { status: 'completed'; response: AIResponse }
  | { status: 'error'; error: string };

class AIRouterBloc {
  // Implementation
}
```

## Implementation Guidelines

### 1. Start Simple

Begin with the simplest approach that meets the requirements:

1. Use local state by default
2. Move to React Context when state needs to be shared
3. Use Redux only when truly needed for global state
4. Apply BLoC pattern for complex state transitions

### 2. Consistent Patterns

Use consistent patterns across the application:

- Create custom hooks for all state access
- Follow naming conventions (`useFeature`, `useSubscription`)
- Separate state management code from UI components

### 3. Performance Considerations

Optimize for performance:

- Use memoization (`useMemo`, `useCallback`) to prevent unnecessary re-renders
- Implement context selectors to avoid re-renders when irrelevant state changes
- Split contexts into smaller pieces to minimize re-renders

### 4. Testing

Make state management code testable:

- Extract business logic from UI components
- Use dependency injection for services
- Test state transitions independently of UI

## Conclusion

By applying these state management recommendations based on feature complexity and scope, the Conceptus Veritas application will maintain a balance between simplicity and power. This approach ensures that each feature uses the appropriate level of state management sophistication without unnecessary complexity.
