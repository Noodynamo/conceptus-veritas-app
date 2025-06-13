/**
 * This file demonstrates the differences between ESLint and SonarLint
 *
 * Run ESLint: npx eslint examples/lint-comparison.js
 * SonarLint: Open in VS Code/Cursor with SonarLint extension installed
 */

// ESLint will complain about formatting (missing semicolons, spacing)
// SonarLint won't care about these formatting issues
function badlyFormattedFunction(a, b) {
  return a + b;
}

// SonarLint will detect this unused variable
// ESLint will also detect this, but sometimes with different rules
function unusedVariables() {
  const unusedVar = 'This is unused';
  return 'Something else';
}

// SonarLint will detect this potential null dereference
// ESLint may not catch this specific issue
function potentialNullDereference(obj) {
  // SonarLint warns about potential null dereference
  return obj.property.nestedProperty;
}

// SonarLint detects this security vulnerability (regex DoS)
// ESLint would need a security plugin to detect this
function regexDenialOfService(input) {
  // Vulnerable to catastrophic backtracking
  const regex = /^(a+)+$/;
  return regex.test(input);
}

// ESLint will detect style issues (like inconsistent return)
// SonarLint focuses more on the logical problems
function inconsistentReturns(value) {
  if (value) {
    return true;
  }
  // Missing return statement
}

// SonarLint detects this cognitive complexity issue
// ESLint may have a similar rule but often with different thresholds
function complexFunction(a, b, c, d, e) {
  let result = 0;

  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        for (let i = 0; i < d; i++) {
          while (e > 0) {
            result += a * b * c * i * e;
            e--;
          }
        }
      }
    }
  }

  return result;
}

// Export functions to avoid unused function warnings
module.exports = {
  badlyFormattedFunction,
  unusedVariables,
  potentialNullDereference,
  regexDenialOfService,
  inconsistentReturns,
  complexFunction,
};
