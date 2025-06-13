#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Analytics Schema Version Management Script
.DESCRIPTION
    Manages versioning for analytics event schemas, including validation, migration, and documentation.
.PARAMETER Command
    The operation to perform: validate, migrate, document, or init
.PARAMETER SchemaFile
    Path to the schema file to process
.PARAMETER Version
    Version number for the schema
.PARAMETER OutputDir
    Directory where output files should be saved
.EXAMPLE
    ./analytics-schema-manager.ps1 -Command validate -SchemaFile ./schemas/user-event-v1.json
.EXAMPLE
    ./analytics-schema-manager.ps1 -Command migrate -SchemaFile ./schemas/user-event-v1.json -Version 2
.EXAMPLE
    ./analytics-schema-manager.ps1 -Command document -OutputDir ./docs/analytics
.NOTES
    Requires PowerShell 5.1 or later
#>

param (
    [Parameter(Mandatory = $true)]
    [ValidateSet("validate", "migrate", "document", "init")]
    [string]$Command,
    
    [Parameter(Mandatory = $false)]
    [string]$SchemaFile,
    
    [Parameter(Mandatory = $false)]
    [string]$Version,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "./backend/src/services/analytics/schemas"
)

# Configuration
$SCHEMA_DIR = "./backend/src/services/analytics/schemas"
$REGISTRY_FILE = "./backend/src/services/analytics/schema-registry.json"
$DOCS_DIR = "./docs/analytics/schemas"

# Ensure directories exist
function EnsureDirectories {
    if (-Not (Test-Path $SCHEMA_DIR)) {
        New-Item -ItemType Directory -Path $SCHEMA_DIR -Force | Out-Null
        Write-Host "Created schema directory: $SCHEMA_DIR" -ForegroundColor Green
    }
    
    if (-Not (Test-Path $DOCS_DIR)) {
        New-Item -ItemType Directory -Path $DOCS_DIR -Force | Out-Null
        Write-Host "Created documentation directory: $DOCS_DIR" -ForegroundColor Green
    }
}

# Initialize the schema registry if it doesn't exist
function InitializeRegistry {
    if (-Not (Test-Path $REGISTRY_FILE)) {
        $registry = @{
            "schemaVersions" = @{}
            "latestVersions" = @{}
            "migrations" = @{}
            "lastUpdated" = (Get-Date).ToString("o")
        }
        $registry | ConvertTo-Json -Depth 10 | Out-File -FilePath $REGISTRY_FILE -Encoding utf8
        Write-Host "Initialized schema registry at $REGISTRY_FILE" -ForegroundColor Green
    } else {
        Write-Host "Schema registry already exists at $REGISTRY_FILE" -ForegroundColor Yellow
    }
}

# Validate a schema file
function ValidateSchema {
    param (
        [string]$SchemaFile
    )
    
    if (-Not (Test-Path $SchemaFile)) {
        Write-Host "Error: Schema file not found: $SchemaFile" -ForegroundColor Red
        exit 1
    }
    
    try {
        $schema = Get-Content -Path $SchemaFile -Raw | ConvertFrom-Json
        
        # Basic validation
        if (-Not $schema.name) {
            Write-Host "Error: Schema must have a 'name' property" -ForegroundColor Red
            exit 1
        }
        
        if (-Not $schema.version) {
            Write-Host "Error: Schema must have a 'version' property" -ForegroundColor Red
            exit 1
        }
        
        if (-Not $schema.properties) {
            Write-Host "Error: Schema must have a 'properties' object" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Schema validation successful for $SchemaFile" -ForegroundColor Green
        return $schema
    }
    catch {
        Write-Host "Error: Invalid JSON in schema file: $_" -ForegroundColor Red
        exit 1
    }
}

# Create a new schema version
function MigrateSchema {
    param (
        [string]$SchemaFile,
        [string]$Version
    )
    
    $schema = ValidateSchema -SchemaFile $SchemaFile
    $newVersion = [int]$Version
    $currentVersion = [int]$schema.version
    
    if ($newVersion -le $currentVersion) {
        Write-Host "Error: New version ($newVersion) must be greater than current version ($currentVersion)" -ForegroundColor Red
        exit 1
    }
    
    $schema.version = $newVersion
    $schema.previousVersion = $currentVersion
    
    $schemaName = $schema.name
    $outputPath = Join-Path -Path $SCHEMA_DIR -ChildPath "$schemaName-v$newVersion.json"
    
    $schema | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputPath -Encoding utf8
    Write-Host "Created new schema version: $outputPath" -ForegroundColor Green
    
    # Update registry
    $registryContent = Get-Content -Path $REGISTRY_FILE -Raw
    $registry = $registryContent | ConvertFrom-Json
    
    # Initialize array if needed
    if (-Not ($registry.schemaVersions | Get-Member -Name $schemaName)) {
        $registry.schemaVersions | Add-Member -MemberType NoteProperty -Name $schemaName -Value @()
    }
    
    # Add version to array and update latest version
    $versionArray = $registry.schemaVersions.$schemaName
    $versionArray += $newVersion
    $registry.schemaVersions.$schemaName = $versionArray
    
    # Update latest version
    if (-Not ($registry.latestVersions | Get-Member -Name $schemaName)) {
        $registry.latestVersions | Add-Member -MemberType NoteProperty -Name $schemaName -Value $newVersion
    } else {
        $registry.latestVersions.$schemaName = $newVersion
    }
    
    $registry.lastUpdated = (Get-Date).ToString("o")
    $registry | ConvertTo-Json -Depth 10 | Out-File -FilePath $REGISTRY_FILE -Encoding utf8
    Write-Host "Updated schema registry with new version" -ForegroundColor Green
}

# Generate documentation for all schemas
function GenerateDocumentation {
    param (
        [string]$OutputDir
    )
    
    if (-Not (Test-Path $REGISTRY_FILE)) {
        Write-Host "Error: Schema registry not found. Run init command first." -ForegroundColor Red
        exit 1
    }
    
    $registry = Get-Content -Path $REGISTRY_FILE -Raw | ConvertFrom-Json
    $indexContent = "# Analytics Event Schemas Documentation`r`n`r`n"
    $indexContent += "Last Updated: $($registry.lastUpdated)`r`n`r`n"
    $indexContent += "## Event Types`r`n`r`n"
    
    # Get all schema names
    $schemaNames = @()
    foreach ($prop in $registry.latestVersions.PSObject.Properties) {
        $schemaNames += $prop.Name
    }
    
    foreach ($schemaName in $schemaNames) {
        $latestVersion = $registry.latestVersions.$schemaName
        $schemaPath = Join-Path -Path $SCHEMA_DIR -ChildPath "$schemaName-v$latestVersion.json"
        
        if (Test-Path $schemaPath) {
            $schema = Get-Content -Path $schemaPath -Raw | ConvertFrom-Json
            
            # Add to index
            $indexContent += "- [$schemaName (v$latestVersion)]($schemaName.md)`r`n"
            
            # Create schema-specific documentation
            $schemaContent = "# $schemaName (v$latestVersion)`r`n`r`n"
            
            if ($schema.description) {
                $schemaContent += "$($schema.description)`r`n`r`n"
            }
            
            $schemaContent += "## Schema Evolution`r`n`r`n"
            $schemaContent += "| Version | Changes |`r`n"
            $schemaContent += "|---------|---------|`r`n"
            
            # Get versions
            $versions = @()
            foreach ($ver in $registry.schemaVersions.$schemaName) {
                $versions += $ver
            }
            $versions = $versions | Sort-Object
            
            foreach ($version in $versions) {
                $versionPath = Join-Path -Path $SCHEMA_DIR -ChildPath "$schemaName-v$version.json"
                if (Test-Path $versionPath) {
                    $versionSchema = Get-Content -Path $versionPath -Raw | ConvertFrom-Json
                    $changes = if ($versionSchema.changes) { $versionSchema.changes } else { "Initial version" }
                    $schemaContent += "| $version | $changes |`r`n"
                }
            }
            
            $schemaContent += "`r`n## Properties`r`n`r`n"
            $schemaContent += "| Property | Type | Required | Description |`r`n"
            $schemaContent += "|----------|------|----------|-------------|`r`n"
            
            # Document properties
            foreach ($prop in $schema.properties.PSObject.Properties) {
                $name = $prop.Name
                $type = $prop.Value.type
                $isRequired = if ($schema.required -contains $name) { "Yes" } else { "No" }
                $description = if ($prop.Value.description) { $prop.Value.description } else { "" }
                
                $schemaContent += "| $name | $type | $isRequired | $description |`r`n"
            }
            
            $schemaContent += "`r`n## Example`r`n`r`n"
            $schemaContent += "```json`r`n"
            
            # Create example data based on schema
            $example = @{}
            foreach ($prop in $schema.properties.PSObject.Properties) {
                $name = $prop.Name
                $type = $prop.Value.type
                
                $exampleValue = switch ($type) {
                    "string" { if ($prop.Value.example) { $prop.Value.example } else { "example_string" } }
                    "number" { if ($prop.Value.example) { $prop.Value.example } else { 123 } }
                    "integer" { if ($prop.Value.example) { $prop.Value.example } else { 42 } }
                    "boolean" { if ($prop.Value.example) { $prop.Value.example } else { $true } }
                    "array" { @() }
                    "object" { @{} }
                    default { $null }
                }
                
                $example[$name] = $exampleValue
            }
            
            $schemaContent += ($example | ConvertTo-Json)
            $schemaContent += "`r`n```"
            
            # Write documentation file
            $docPath = Join-Path -Path $OutputDir -ChildPath "$schemaName.md"
            $schemaContent | Out-File -FilePath $docPath -Encoding utf8
            Write-Host "Generated documentation for $schemaName at $docPath" -ForegroundColor Green
        }
    }
    
    # Write index file
    $indexPath = Join-Path -Path $OutputDir -ChildPath "README.md"
    $indexContent | Out-File -FilePath $indexPath -Encoding utf8
    Write-Host "Generated documentation index at $indexPath" -ForegroundColor Green
}

# Main execution logic
EnsureDirectories

switch ($Command) {
    "init" {
        InitializeRegistry
    }
    "validate" {
        if (-Not $SchemaFile) {
            Write-Host "Error: SchemaFile parameter is required for validate command" -ForegroundColor Red
            exit 1
        }
        ValidateSchema -SchemaFile $SchemaFile
    }
    "migrate" {
        if (-Not $SchemaFile -or -Not $Version) {
            Write-Host "Error: SchemaFile and Version parameters are required for migrate command" -ForegroundColor Red
            exit 1
        }
        MigrateSchema -SchemaFile $SchemaFile -Version $Version
    }
    "document" {
        $docOutputDir = if ($OutputDir) { $OutputDir } else { $DOCS_DIR }
        GenerateDocumentation -OutputDir $docOutputDir
    }
}

Write-Host "Analytics schema management operation completed successfully" -ForegroundColor Green 